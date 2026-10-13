import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatNaira } from '../lib/money'
import type { CartItem } from '../types'

export default function Cart() {
  const { items, subtotal, removeFromCart, setQuantity, clearCart } = useCart()
  const navigate = useNavigate()
  const [coupon, setCoupon] = useState('')
  const [couponMsg, setCouponMsg] = useState('')
  const [stockNote, setStockNote] = useState('')

  // Lines the seller can no longer fulfil — stock may have fallen since the
  // item went into the cart. Checkout would reject these, so block it here.
  const unfulfillable = items.filter((i) => i.quantity > i.product.stock)

  async function handleQuantityChange(item: CartItem, value: number) {
    const result = await setQuantity(item.product.id, item.size, value)
    setStockNote(
      result.capped
        ? `${item.product.name}: only ${result.stock} in stock, quantity set to ${result.quantity}.`
        : '',
    )
  }

  function applyCoupon() {
    setCouponMsg(
      coupon.trim() ? `Coupon "${coupon.trim()}" is not valid for this demo.` : '',
    )
  }

  return (
    <>
      <section className="page-banner">
        <div className="banner-rule" />
        <h2>Your cart</h2>
        <p>Check the quantities, then choose delivery or collection at checkout.</p>
      </section>

      <section className="section-x">
        {items.length === 0 ? (
          <div className="empty-state">
            <img src="/assets/images/empty-cart.svg" alt="" aria-hidden="true" />
            <h4>Your cart is empty</h4>
            <p>Browse the marketplace and add something from a shop near you.</p>
            <Link to="/shop">
              <button className="btn-primary">Continue shopping</button>
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-primary-border">
              <table className="w-full border-collapse whitespace-nowrap bg-surface">
                <thead className="bg-primary text-white">
                  <tr className="text-center text-[12px] font-bold uppercase tracking-wide">
                    <td className="py-3.5">Remove</td>
                    <td className="py-3.5">Image</td>
                    <td className="py-3.5 text-left">Product</td>
                    <td className="py-3.5">Price</td>
                    <td className="py-3.5">Quantity</td>
                    <td className="py-3.5">Subtotal</td>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr
                      key={`${item.product.id}__${item.size}`}
                      className="border-b border-primary-border text-center text-[13px] text-muted last:border-0"
                    >
                      <td className="px-3 py-4">
                        <button
                          className="text-base text-muted-2 transition hover:text-accent"
                          aria-label={`Remove ${item.product.name}`}
                          onClick={() => removeFromCart(item.product.id, item.size)}
                        >
                          <i className="fa-regular fa-circle-xmark"></i>
                        </button>
                      </td>
                      <td className="px-3 py-4">
                        <img
                          className="mx-auto h-[64px] w-[64px] rounded-md border border-primary-border object-cover"
                          src={item.product.image_url ?? ''}
                          alt={item.product.name}
                        />
                      </td>
                      <td className="px-3 py-4 text-left font-semibold text-ink">
                        {item.product.name}
                        {item.size && (
                          <span className="block text-xs font-normal text-muted-2">{item.size}</span>
                        )}
                      </td>
                      <td className="px-3 py-4">{formatNaira(item.product.price)}</td>
                      <td className="px-3 py-4">
                        <input
                          type="number"
                          min={1}
                          max={Math.max(1, item.product.stock)}
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item, Number(e.target.value))}
                          aria-label={`Quantity for ${item.product.name}`}
                          className="w-[70px] rounded-md border border-primary-border py-2 text-center outline-none focus:border-primary"
                        />
                        {item.product.stock <= 0 ? (
                          <span className="mt-1 block text-[11px] font-bold text-accent">
                            Out of stock
                          </span>
                        ) : (
                          item.quantity >= item.product.stock && (
                            <span className="mt-1 block text-[11px] font-bold text-cta-ink">
                              Max {item.product.stock} in stock
                            </span>
                          )
                        )}
                      </td>
                      <td className="px-3 py-4 font-bold text-primary">
                        {formatNaira(item.product.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {stockNote && (
              <p className="mt-3 rounded border-l-[3px] border-cta bg-cta-soft px-3 py-2 text-sm font-semibold text-cta-ink">
                {stockNote}
              </p>
            )}

            {unfulfillable.length > 0 && (
              <p className="mt-3 rounded border-l-[3px] border-accent bg-[#fdecec] px-3 py-2 text-sm text-accent">
                {unfulfillable.map((i) => i.product.name).join(', ')}{' '}
                {unfulfillable.length === 1 ? 'is' : 'are'} no longer available in the quantity you
                picked. Lower the quantity or remove the item to continue.
              </p>
            )}

            <div className="mt-5">
              <button className="btn-normal" onClick={clearCart}>
                Clear cart
              </button>
            </div>
          </>
        )}
      </section>

      <section className="section-x flex flex-wrap justify-between gap-8 bg-surface-2">
        <div className="w-full lg:w-1/2">
          <h3 className="pb-4 text-lg font-bold text-primary">Apply coupon</h3>
          <div className="flex flex-wrap gap-2.5">
            <label htmlFor="coupon-code" className="sr-only">
              Coupon code
            </label>
            <input
              id="coupon-code"
              type="text"
              placeholder="Enter coupon code"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              className="w-[60%] rounded-md border border-primary-border bg-surface px-5 py-2.5 outline-none focus:border-primary"
            />
            <button
              className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark"
              onClick={applyCoupon}
            >
              Apply
            </button>
          </div>
          {couponMsg && <p className="mt-2.5 text-[13px] text-accent">{couponMsg}</p>}
        </div>

        <div className="w-full rounded-lg border border-primary-border bg-surface p-[30px] lg:w-[45%]">
          <h3 className="pb-4 text-lg font-bold text-primary">Cart totals</h3>
          <table className="mb-5 w-full border-collapse">
            <tbody className="text-sm">
              <tr className="border-b border-primary-border">
                <td className="w-1/2 py-2.5 text-muted">Cart subtotal</td>
                <td className="w-1/2 py-2.5 text-right">{formatNaira(subtotal)}</td>
              </tr>
              <tr className="border-b border-primary-border">
                <td className="py-2.5 text-muted">Shipping</td>
                <td className="py-2.5 text-right">Free</td>
              </tr>
              <tr className="text-base">
                <td className="pt-3"><strong className="text-ink">Total</strong></td>
                <td className="pt-3 text-right">
                  <strong className="text-primary">{formatNaira(subtotal)}</strong>
                </td>
              </tr>
            </tbody>
          </table>
          <button
            className="btn-primary w-full"
            disabled={items.length === 0 || unfulfillable.length > 0}
            onClick={() => navigate('/checkout')}
          >
            Proceed to checkout
          </button>
          {unfulfillable.length > 0 && (
            <p className="mt-2 text-xs text-accent">
              Fix the highlighted quantities above to check out.
            </p>
          )}
        </div>
      </section>
    </>
  )
}
