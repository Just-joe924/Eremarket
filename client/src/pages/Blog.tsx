import Newsletter from '../components/Newsletter'
import { blogPosts } from '../data/blog'

/* No EreMarket editorial photography exists yet, so each card is built from
   type and flat geometry: a teal header block carrying the category and date,
   an orange rule, then the excerpt. Swap in imagery later without touching the
   card's structure. */

const categoryTopics = [
  { label: 'Inventory', icon: 'fa-boxes-stacked' },
  { label: 'Pricing', icon: 'fa-naira-sign' },
  { label: 'Payments', icon: 'fa-credit-card' },
  { label: 'Merchandising', icon: 'fa-camera' },
  { label: 'Wholesale', icon: 'fa-truck-ramp-box' },
]

export default function Blog() {
  const [lead, ...rest] = blogPosts

  return (
    <>
      <section className="page-banner">
        <div className="banner-rule" />
        <h2>The Merchant Desk</h2>
        <p>
          Practical notes on stock, pricing and getting paid — written for the shops, supermarkets
          and suppliers trading on EreMarket.
        </p>
      </section>

      {/* --- Topic rail ---------------------------------------------------- */}
      <section className="border-b border-primary-border bg-surface-2 px-5 py-5 sm:px-10 lg:px-20">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="eyebrow mr-1">Topics</span>
          {categoryTopics.map((t) => (
            <span
              key={t.label}
              className="inline-flex items-center gap-2 rounded-full border border-primary-border bg-surface px-3.5 py-1.5 text-xs font-bold text-primary"
            >
              <i className={`fa-solid ${t.icon} text-cta`} aria-hidden="true"></i>
              {t.label}
            </span>
          ))}
        </div>
      </section>

      {/* --- Lead article --------------------------------------------------- */}
      {lead && (
        <section className="section-x">
          <article className="relative overflow-hidden rounded-lg bg-primary p-8 sm:p-12">
            <span className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/[0.05]" />
            <span className="pointer-events-none absolute -bottom-16 right-1/3 h-44 w-44 rotate-12 bg-cta/10" />
            <div className="relative z-10 max-w-3xl">
              <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.16em]">
                <span className="rounded bg-cta px-2.5 py-1 text-primary-dark">{lead.category}</span>
                <span className="text-white/60">{lead.date}</span>
                <span className="text-white/60">{lead.readMinutes} min read</span>
              </div>
              <h2 className="mt-5 text-[28px] font-bold leading-tight text-white sm:text-[40px]">
                {lead.title}
              </h2>
              <div className="mt-5 h-1 w-16 rounded-full bg-cta" />
              <p className="mt-5 text-base leading-relaxed text-white/80">{lead.excerpt}</p>
              <a
                href="#"
                className="mt-7 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-cta transition hover:gap-3"
              >
                Continue reading
                <i className="fa-solid fa-arrow-right-long" aria-hidden="true"></i>
              </a>
            </div>
          </article>
        </section>
      )}

      {/* --- Article grid --------------------------------------------------- */}
      <section className="px-5 pb-10 sm:px-10 lg:px-20">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {rest.map((post) => (
            <article
              key={post.id}
              className="flex flex-col overflow-hidden rounded-lg border border-primary-border bg-surface transition hover:border-primary hover:shadow-[0_8px_24px_rgba(31,82,87,0.10)]"
            >
              {/* Geometric header block stands in for a photograph */}
              <div className="relative flex h-28 items-end overflow-hidden bg-primary px-6 pb-4">
                <span className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/[0.06]" />
                <span className="pointer-events-none absolute bottom-0 left-0 h-1 w-full bg-cta" />
                <span className="relative z-10 text-2xl font-bold uppercase tracking-[0.12em] text-white/90">
                  {post.category}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wide text-muted-2">
                  <span>{post.date}</span>
                  <span aria-hidden="true">·</span>
                  <span>{post.readMinutes} min read</span>
                </div>
                <h3 className="mt-3 text-lg font-bold leading-snug text-primary">{post.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{post.excerpt}</p>
                <a
                  href="#"
                  className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-cta-ink transition hover:gap-3"
                >
                  Continue reading
                  <i className="fa-solid fa-arrow-right-long" aria-hidden="true"></i>
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-x flex items-center justify-center gap-2.5 pt-0">
        <a
          href="#"
          aria-current="page"
          className="flex h-10 w-10 items-center justify-center rounded-md bg-cta text-sm font-bold text-primary-dark"
        >
          1
        </a>
        <a
          href="#"
          className="flex h-10 w-10 items-center justify-center rounded-md border border-primary-border text-sm font-bold text-primary transition hover:border-primary"
        >
          2
        </a>
        <a
          href="#"
          aria-label="Next page"
          className="flex h-10 w-10 items-center justify-center rounded-md border border-primary-border text-primary transition hover:border-primary"
        >
          <i className="fa-solid fa-arrow-right-long"></i>
        </a>
      </section>

      <Newsletter />
    </>
  )
}
