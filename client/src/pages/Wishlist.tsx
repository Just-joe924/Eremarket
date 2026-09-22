import { Link, useNavigate } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import { formatNaira } from '../lib/money'

export default function Wishlist() {
  const { items, loading, toggle } = useWishlist()
  const { addToCart } = useCart()
  const navigate = useNavigate()

  return (
    <>
      <section className="page-banner">
        <div className="banner-rule" />
        <h2>Saved items</h2>
        <p>Products you've kept an eye on across the marketplace.</p>
      </section>

      <section className="section-x">
        {loading ? (
          <p className="text-muted">Loading your saved items…</p>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <img src="/assets/images/empty-wishlist.svg" alt="" aria-hidden="true" />
            <h4>Nothing saved yet</h4>
            <p>Tap the heart on any product to keep it here while you decide.</p>
            <Link to="/shop">
              <button className="btn-primary">Browse products</button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((product) => (
              <div key={product.id} className="pro-card w-full">
                <img
                  className="aspect-square w-full bg-surface-2 object-cover"
                  src={product.image_url ?? ''}
                  alt={product.name}
                  onClick={() => navigate(`/product/${product.slug}`)}
                />
                <div className="flex flex-1 flex-col p-3.5 text-start">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-2">
                    {product.categories?.name ?? 'Marketplace'}
                  </span>
                  <h5 className="line-clamp-2 min-h-[2.5rem] pt-1 text-sm font-semibold text-ink">
                    {product.name}
                  </h5>
                  <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                    <h4 className="text-[17px] font-bold text-primary">
                      {formatNaira(product.price)}
                    </h4>
                    <div className="flex gap-2">
                      <button
                        className="flex h-9 w-9 items-center justify-center rounded-md bg-cta text-sm text-primary-dark transition hover:bg-cta-hover"
                        aria-label={`Add ${product.name} to cart`}
                        onClick={() =>
                          product.sizes?.length
                            ? navigate(`/product/${product.slug}`)
                            : addToCart(product, 1, '')
                        }
                      >
                        <i className="fas fa-shopping-cart"></i>
                      </button>
                      <button
                        className="flex h-9 w-9 items-center justify-center rounded-md border border-primary-border bg-surface text-accent transition hover:bg-accent hover:text-white"
                        aria-label={`Remove ${product.name} from saved items`}
                        onClick={() => toggle(product)}
                      >
                        <i className="fas fa-heart"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
