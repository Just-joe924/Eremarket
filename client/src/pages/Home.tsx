import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Feature from '../components/Feature'
import Newsletter from '../components/Newsletter'
import ProductCard from '../components/ProductCard'
import { listNewest } from '../api/products'
import type { Product } from '../types'

const gridClass = 'grid grid-cols-1 gap-5 pt-2.5 sm:grid-cols-2 lg:grid-cols-4'

function ProductGrid({ products, loading }: { products: Product[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <i className="fa-solid fa-spinner fa-spin text-3xl text-primary"></i>
      </div>
    )
  }
  return (
    <div className={gridClass}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

/** Section heading used above each product grid. */
function SectionHead({ eyebrow, title, blurb }: { eyebrow: string; title: string; blurb: string }) {
  return (
    <div className="mb-2">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-1 text-2xl font-bold text-primary sm:text-[34px]">{title}</h2>
      <p className="mt-1 text-sm text-muted">{blurb}</p>
    </div>
  )
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    listNewest(16)
      .then((data) => active && setProducts(data))
      .catch((err) => console.error('Failed to load products:', err))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const featured = products.slice(0, 8)
  const newArrivals = products.slice(8, 16)

  return (
    <>
      {/* --- Hero: local retail, not a fashion editorial -------------------- */}
      <section className="bg-surface-2">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center gap-8 px-5 py-12 sm:px-10 lg:flex-row lg:gap-12 lg:px-20 lg:py-16">
          <div className="w-full lg:w-[46%]">
            <p className="eyebrow">Ojodu &amp; around</p>
            <h1 className="mt-2 text-[34px] font-bold leading-[1.1] text-primary sm:text-[46px]">
              Every shop on your street, in one marketplace
            </h1>
            <p className="mt-4 max-w-lg text-base text-muted">
              Supermarkets, provision stores, hardware and wholesale suppliers list what they
              actually have in stock — priced in naira. Order for delivery, or reserve now and pay
              at the counter when you collect.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/shop">
                <button className="btn-primary">Start shopping</button>
              </Link>
              <Link to="/seller/onboarding">
                <button className="btn-outline">List your shop</button>
              </Link>
            </div>
            <dl className="mt-9 flex flex-wrap gap-x-10 gap-y-4 border-t border-primary-border pt-6">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-2">
                  Pay how you like
                </dt>
                <dd className="text-sm font-bold text-primary">Card, transfer, USSD or cash</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-2">
                  Collect from
                </dt>
                <dd className="text-sm font-bold text-primary">A shop you can walk into</dd>
              </div>
            </dl>
          </div>

          <div className="w-full lg:w-[54%]">
            <img
              src="/assets/images/hero-retail.png"
              alt="Local retail shops and a supermarket alongside an inventory and sales dashboard"
              className="h-auto w-full"
              width={1600}
              height={800}
            />
          </div>
        </div>
      </section>

      <Feature />

      <section className="section-x">
        <SectionHead
          eyebrow="Popular right now"
          title="Featured products"
          blurb="What buyers around you are ordering this week."
        />
        <ProductGrid products={featured} loading={loading} />
      </section>

      {/* --- Merchant band: structural teal with flat geometry -------------- */}
      <section className="relative my-4 overflow-hidden bg-primary px-5 py-14 sm:px-10 lg:px-20">
        <span className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/[0.05]" />
        <span className="pointer-events-none absolute -bottom-14 right-1/4 h-40 w-40 rotate-12 bg-cta/10" />
        <div className="relative z-10 flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cta">For merchants</p>
            <h2 className="mt-2 max-w-xl text-2xl font-bold text-white sm:text-[32px]">
              Put your shelves online without leaving the counter
            </h2>
            <p className="mt-3 max-w-xl text-sm text-white/75">
              Add products from your phone, keep stock counts current, and fulfil orders as buyers
              place them. No listing fee.
            </p>
          </div>
          <Link to="/seller/onboarding" className="shrink-0">
            <button className="btn-primary">Open a storefront</button>
          </Link>
        </div>
      </section>

      <section className="section-x">
        <SectionHead
          eyebrow="Just listed"
          title="New arrivals"
          blurb="Fresh stock added by merchants in the last few days."
        />
        <ProductGrid products={newArrivals} loading={loading} />
      </section>

      {/* --- Two-up positioning cards (CSS only, no stock photography) ------ */}
      <section className="section-x grid gap-5 sm:grid-cols-2">
        <div className="relative flex min-h-[280px] flex-col justify-center overflow-hidden rounded-lg bg-primary p-8">
          <span className="pointer-events-none absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-cta/15" />
          <div className="relative z-10">
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-cta text-xl text-primary-dark">
              <i className="fa-solid fa-store" aria-hidden="true"></i>
            </span>
            <h3 className="text-2xl font-bold text-white">Reserve &amp; collect</h3>
            <p className="mt-2 max-w-sm text-sm text-white/75">
              Hold an item online, walk into the shop and pay at the counter. Nothing leaves the
              store until you've seen it.
            </p>
            <Link to="/shop">
              <button className="btn-white mt-6">Browse shops</button>
            </Link>
          </div>
        </div>

        <div className="relative flex min-h-[280px] flex-col justify-center overflow-hidden rounded-lg border border-primary-border bg-surface-2 p-8">
          <span className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rotate-12 bg-primary/5" />
          <div className="relative z-10">
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-xl text-cta">
              <i className="fa-solid fa-boxes-stacked" aria-hidden="true"></i>
            </span>
            <h3 className="text-2xl font-bold text-primary">Buy by the carton</h3>
            <p className="mt-2 max-w-sm text-sm text-muted">
              Retailers and caterers restocking in volume can order straight from wholesale
              suppliers listed on EreMarket.
            </p>
            <Link to="/shop">
              <button className="btn-outline mt-6 px-6 py-3">See suppliers</button>
            </Link>
          </div>
        </div>
      </section>

      {/* --- Three-up trust strip ------------------------------------------- */}
      <section className="grid gap-5 px-5 pb-10 sm:grid-cols-3 sm:px-10 lg:px-20">
        {[
          {
            icon: 'fa-location-dot',
            title: 'Merchants near you',
            body: 'Every storefront carries a real address, a landmark and a phone number.',
          },
          {
            icon: 'fa-receipt',
            title: 'Receipts on every order',
            body: 'Emailed the moment you pay or reserve, with the shop details attached.',
          },
          {
            icon: 'fa-arrows-rotate',
            title: 'Stock kept current',
            body: 'Merchants update counts as they sell, so listings reflect the shelf.',
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-lg border-l-[3px] border-cta bg-surface-2 px-6 py-7"
          >
            <i className={`fa-solid ${item.icon} text-lg text-primary`} aria-hidden="true"></i>
            <h3 className="mt-3 text-base font-bold text-primary">{item.title}</h3>
            <p className="mt-1.5 text-sm text-muted">{item.body}</p>
          </div>
        ))}
      </section>

      <Newsletter />
    </>
  )
}
