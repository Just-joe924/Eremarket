import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { CartItem, Product } from '../types'
import { useAuth } from './AuthContext'
import { clearCartDb, fetchCart, removeCartItem, setCartItem } from '../api/cart'

/**
 * What a cart write ended up doing, so the page can tell the buyer when their
 * request was trimmed to the stock on hand.
 */
export interface CartWriteResult {
  /** Quantity now on the line. */
  quantity: number
  /** True when the requested quantity was more than the stock available. */
  capped: boolean
  /** The stock the clamp was applied against. */
  stock: number
}

interface CartContextValue {
  items: CartItem[]
  totalQuantity: number
  subtotal: number
  loading: boolean
  addToCart: (product: Product, quantity?: number, size?: string) => Promise<CartWriteResult>
  removeFromCart: (productId: string, size: string) => Promise<void>
  setQuantity: (productId: string, size: string, quantity: number) => Promise<CartWriteResult>
  clearCart: () => Promise<void>
  /** Quantity already in the cart for a product + size line. */
  quantityInCart: (productId: string, size: string) => number
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

const GUEST_KEY = 'cara-cart-guest'

/** A cart line is identified by product + chosen size. */
const lineKey = (productId: string, size: string) => `${productId}__${size}`

/**
 * Stock is the ceiling for a cart line: a buyer can never hold more of a
 * product than the seller has. The server re-checks this at checkout — this is
 * the same rule applied up front so the buyer isn't surprised at the till.
 */
function capToStock(stock: number, wanted: number): number {
  const ceiling = Math.max(0, Math.floor(stock) || 0)
  return Math.max(0, Math.min(Math.floor(wanted) || 0, ceiling))
}

function loadGuest(): CartItem[] {
  try {
    const raw = localStorage.getItem(GUEST_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CartItem[]
    // Backfill size for carts saved before sizes existed.
    return Array.isArray(parsed) ? parsed.map((i) => ({ ...i, size: i.size ?? '' })) : []
  } catch {
    return []
  }
}

const saveGuest = (items: CartItem[]) => localStorage.setItem(GUEST_KEY, JSON.stringify(items))
const clearGuest = () => localStorage.removeItem(GUEST_KEY)

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  // Load the cart for the current identity. When a guest signs in, their local
  // cart is merged into the database cart (per product+size), then cleared.
  useEffect(() => {
    let active = true
    const userId = user?.id ?? null

    async function sync() {
      setLoading(true)
      if (!userId) {
        if (active) setItems(loadGuest())
        if (active) setLoading(false)
        return
      }

      const guest = loadGuest()
      const dbItems = await fetchCart(userId)

      if (guest.length === 0) {
        if (active) setItems(dbItems)
        if (active) setLoading(false)
        return
      }

      const merged = new Map<string, CartItem>()
      for (const it of dbItems) merged.set(lineKey(it.product.id, it.size), it)
      for (const g of guest) {
        const key = lineKey(g.product.id, g.size)
        const existing = merged.get(key)
        const product = existing?.product ?? g.product
        merged.set(key, {
          product,
          size: g.size,
          // Two carts adding up can overshoot stock — keep the line at 1 or more
          // so the row survives (cart_items requires quantity > 0) and let
          // checkout reject what can no longer be fulfilled.
          quantity: Math.max(
            1,
            capToStock(product.stock, (existing?.quantity ?? 0) + g.quantity),
          ),
        })
      }
      await Promise.all(
        [...merged.values()].map((it) => setCartItem(userId, it.product.id, it.size, it.quantity)),
      )
      clearGuest()
      if (active) setItems([...merged.values()])
      if (active) setLoading(false)
    }

    sync().catch((err) => {
      console.error('Cart sync failed:', err)
      if (active) setLoading(false)
    })

    return () => {
      active = false
    }
  }, [user?.id])

  async function addToCart(
    product: Product,
    quantity = 1,
    size = '',
  ): Promise<CartWriteResult> {
    const existing = items.find((i) => i.product.id === product.id && i.size === size)
    const current = existing?.quantity ?? 0
    const wanted = current + Math.max(1, Math.floor(quantity) || 1)
    const newQty = capToStock(product.stock, wanted)
    const result: CartWriteResult = {
      quantity: newQty,
      capped: newQty < wanted,
      stock: product.stock,
    }

    // Nothing left to add — the line already holds every unit in stock (or the
    // product is out of stock entirely).
    if (newQty === current) return result

    if (user) await setCartItem(user.id, product.id, size, newQty)
    setItems((prev) => {
      const found = prev.some((i) => i.product.id === product.id && i.size === size)
      const next = found
        ? prev.map((i) =>
            i.product.id === product.id && i.size === size ? { ...i, quantity: newQty } : i,
          )
        : [...prev, { product, quantity: newQty, size }]
      if (!user) saveGuest(next)
      return next
    })
    return result
  }

  async function setQuantity(
    productId: string,
    size: string,
    quantity: number,
  ): Promise<CartWriteResult> {
    const line = items.find((i) => i.product.id === productId && i.size === size)
    if (!line) return { quantity: 0, capped: false, stock: 0 }

    const wanted = Math.max(1, Math.floor(quantity) || 1)
    // A line never drops below 1 (cart_items requires quantity > 0); removing is
    // what removeFromCart is for.
    const safe = Math.max(1, capToStock(line.product.stock, wanted))
    const result: CartWriteResult = {
      quantity: safe,
      capped: safe < wanted,
      stock: line.product.stock,
    }

    if (user) await setCartItem(user.id, productId, size, safe)
    setItems((prev) => {
      const next = prev.map((i) =>
        i.product.id === productId && i.size === size ? { ...i, quantity: safe } : i,
      )
      if (!user) saveGuest(next)
      return next
    })
    return result
  }

  async function removeFromCart(productId: string, size: string) {
    if (user) await removeCartItem(user.id, productId, size)
    setItems((prev) => {
      const next = prev.filter((i) => !(i.product.id === productId && i.size === size))
      if (!user) saveGuest(next)
      return next
    })
  }

  async function clearCart() {
    if (user) await clearCartDb(user.id)
    else clearGuest()
    setItems([])
  }

  const quantityInCart = (productId: string, size: string) =>
    items.find((i) => i.product.id === productId && i.size === size)?.quantity ?? 0

  const value = useMemo<CartContextValue>(() => {
    const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0)
    const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
    return {
      items,
      totalQuantity,
      subtotal,
      loading,
      addToCart,
      removeFromCart,
      setQuantity,
      clearCart,
      quantityInCart,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, loading, user])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
