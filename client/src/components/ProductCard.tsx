import { type MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Product } from '../types'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useWishlist } from '../context/WishlistContext'
import { formatNaira } from '../lib/money'
import StarRating from './StarRating'

export default function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { user } = useAuth()
  const { isWishlisted, toggle } = useWishlist()

  const wishlisted = isWishlisted(product.id)
  const outOfStock = product.stock <= 0
  const lowStock = !outOfStock && product.stock <= 5

  function handleAddToCart(e: MouseEvent) {
    e.stopPropagation()
    // Products with sizes need a size chosen — send the buyer to the detail page.
    if (product.sizes && product.sizes.length > 0) {
      navigate(`/product/${product.slug}`)
      return
    }
    addToCart(product, 1, '')
  }

  function handleWishlist(e: MouseEvent) {
    e.stopPropagation()
    if (!user) {
      navigate('/login')
      return
    }
    toggle(product)
  }

  return (
    <div className="pro-card w-full" onClick={() => navigate(`/product/${product.slug}`)}>
      <div className="relative">
        <img
          className="aspect-square w-full bg-surface-2 object-cover"
          src={product.image_url ?? ''}
          alt={product.name}
        />
        <button
          className={`absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-primary-border bg-white transition ${
            wishlisted ? 'text-accent' : 'text-muted-2 hover:text-accent'
          }`}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={handleWishlist}
        >
          <i className={`${wishlisted ? 'fas' : 'far'} fa-heart`}></i>
        </button>
        {outOfStock && (
          <span className="absolute bottom-3 left-3 rounded bg-ink/85 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
            Out of stock
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3.5 text-start">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-2">
          {product.categories?.name ?? 'Marketplace'}
        </span>
        <h5 className="line-clamp-2 min-h-[2.5rem] pt-1 text-sm font-semibold text-ink">
          {product.name}
        </h5>
        {product.rating && product.rating.count > 0 && (
          <div className="flex items-center gap-1 pt-1.5">
            <StarRating value={product.rating.average} sizeClass="text-[11px]" />
            <span className="text-[11px] text-muted-2">({product.rating.count})</span>
          </div>
        )}
        {lowStock && (
          <span className="pt-1.5 text-[11px] font-bold text-cta-ink">
            Only {product.stock} left
          </span>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <h4 className="text-[17px] font-bold text-primary">{formatNaira(product.price)}</h4>
          <button
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-cta text-sm text-primary-dark transition hover:bg-cta-hover"
            aria-label={`Add ${product.name} to cart`}
            onClick={handleAddToCart}
          >
            <i className="fas fa-shopping-cart"></i>
          </button>
        </div>
      </div>
    </div>
  )
}
