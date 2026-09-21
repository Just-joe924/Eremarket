import { Link } from 'react-router-dom'
import Feature from '../components/Feature'
import Newsletter from '../components/Newsletter'

/* No EreMarket photography exists yet. Every visual on this page is CSS —
   teal panels, orange rules, layered blocks — so nothing here depends on
   stock imagery or an external asset host. */

const steps = [
  {
    icon: 'fa-store',
    title: 'Open your storefront',
    body: 'Register, add your business name, shop address and phone number, and your storefront is live. No listing fee, no waiting.',
  },
  {
    icon: 'fa-boxes-stacked',
    title: 'List what you stock',
    body: 'Upload photos, price in naira, set quantities and sizes. EreMarket can even draft the product description for you.',
  },
  {
    icon: 'fa-naira-sign',
    title: 'Get paid',
    body: 'Buyers pay online by card, transfer or USSD — or reserve now and pay you at the counter when they collect.',
  },
]

const audiences = [
  {
    icon: 'fa-basket-shopping',
    title: 'Supermarkets & provision stores',
    body: 'Put everyday stock in front of the street without hiring anyone to run a shop online.',
  },
  {
    icon: 'fa-screwdriver-wrench',
    title: 'Hardware & building supplies',
    body: 'Quote real prices and quantities so buyers arrive knowing what they are collecting.',
  },
  {
    icon: 'fa-truck-ramp-box',
    title: 'Wholesalers & distributors',
    body: 'Sell by the carton to the retailers and caterers already buying around you.',
  },
  {
    icon: 'fa-shop',
    title: 'Independent shops & kiosks',
    body: 'One storefront, one link, and a receipt trail that makes a small shop look established.',
  },
]

export default function About() {
  return (
    <>
      <section className="page-banner">
        <div className="banner-rule" />
        <h2>What EreMarket is</h2>
        <p>The retail marketplace for shops, supermarkets and suppliers around Ojodu.</p>
      </section>

      {/* --- Identity: type beside a layered geometric panel ----------------- */}
      <section className="section-x flex flex-col items-center gap-10 md:flex-row md:items-stretch">
        {/* Decorative block composition — pure CSS, no artwork */}
        <div
          className="relative min-h-[320px] w-full overflow-hidden rounded-lg bg-primary md:w-1/2"
          aria-hidden="true"
        >
          <span className="absolute -left-10 -top-10 h-44 w-44 rounded-full bg-white/[0.06]" />
          <span className="absolute bottom-0 left-0 h-2 w-full bg-cta" />
          <span className="absolute right-10 top-12 h-24 w-24 rotate-12 border-4 border-cta/50" />
          <span className="absolute bottom-16 right-20 h-16 w-40 bg-white/[0.07]" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
            <span className="text-[56px] font-bold leading-none tracking-tight text-white sm:text-[76px]">
              Ere
              <span className="text-cta">Market</span>
            </span>
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-white/60">
              Ojodu · Lagos
            </span>
          </div>
        </div>

        <div className="w-full md:w-1/2 md:pl-4">
          <p className="eyebrow">Our purpose</p>
          <h2 className="mt-2 text-3xl font-bold text-primary sm:text-[40px]">
            A marketplace, not a single shop
          </h2>
          <p className="my-4 text-muted">
            Anyone with stock to sell can open a storefront here in minutes — list your products,
            price them in naira, and start taking orders from people nearby. Buyers get one place to
            browse every store, compare prices, save what they need and read reviews left by people
            who actually bought the item.
          </p>
          <p className="my-4 text-muted">
            We built it around how trade already works here. Pay online with a card, a bank transfer
            or USSD if that's easiest — or reserve your order and pay the merchant in cash when you
            walk in to collect it. Either way you get a receipt by email, and you can follow each
            item from <em>processing</em> to <em>ready</em> to <em>collected</em> in your account.
          </p>
          <p className="my-4 text-muted">
            Every product on EreMarket belongs to a real merchant with a real address and a phone
            number you can call. That's the whole idea: the reach of an online store, with the trust
            of a shop you can walk into.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/shop">
              <button className="btn-primary">Browse the marketplace</button>
            </Link>
            <Link to="/seller/onboarding">
              <button className="btn-outline">Start selling</button>
            </Link>
          </div>
        </div>
      </section>

      {/* --- The retail ecosystem ------------------------------------------- */}
      <section className="bg-surface-2 px-5 py-14 sm:px-10 lg:px-20">
        <p className="eyebrow">Who trades here</p>
        <h2 className="mt-2 text-2xl font-bold text-primary sm:text-[34px]">
          Built for the shops on the street
        </h2>
        <p className="mt-3 max-w-2xl text-muted">
          EreMarket is deliberately general. A supermarket, a hardware store and a drinks
          distributor all need the same four things: a catalogue, current stock counts, a way to get
          paid, and a buyer who knows where to collect.
        </p>
        <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {audiences.map((a) => (
            <div
              key={a.title}
              className="rounded-lg border border-primary-border bg-surface p-6 transition hover:border-primary"
            >
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-cta">
                <i className={`fa-solid ${a.icon}`} aria-hidden="true"></i>
              </span>
              <h4 className="mb-2 text-base font-bold text-primary">{a.title}</h4>
              <p className="text-sm text-muted">{a.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- Merchant value: numbered steps over a teal rail ----------------- */}
      <section className="section-x">
        <p className="eyebrow text-center">For merchants</p>
        <h2 className="mt-2 text-center text-2xl font-bold text-primary sm:text-[34px]">
          Selling on EreMarket
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted">
          Three steps from signing up to your first order.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="relative overflow-hidden rounded-lg border border-primary-border bg-surface p-7 transition hover:border-primary"
            >
              <span
                className="absolute right-4 top-2 select-none text-[64px] font-bold leading-none text-primary-soft"
                aria-hidden="true"
              >
                0{i + 1}
              </span>
              <span className="absolute left-0 top-0 h-full w-1 bg-cta" aria-hidden="true" />
              <div className="relative z-10">
                <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-cta">
                  <i className={`fa-solid ${step.icon}`} aria-hidden="true"></i>
                </span>
                <h4 className="mb-2 text-lg font-bold text-primary">{step.title}</h4>
                <p className="text-sm text-muted">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- Closing band ---------------------------------------------------- */}
      <section className="relative overflow-hidden bg-primary px-5 py-14 text-center sm:px-10 lg:px-20">
        <span className="pointer-events-none absolute -left-16 -bottom-16 h-52 w-52 rounded-full bg-white/[0.05]" />
        <span className="pointer-events-none absolute -right-8 -top-12 h-40 w-40 rotate-12 bg-cta/10" />
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-white sm:text-[34px]">
            Your shelves, online by this evening
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/75">
            Open a storefront free, list your first products, and let buyers nearby find what you
            already have in stock.
          </p>
          <Link to="/seller/onboarding">
            <button className="btn-primary mt-7">Open a storefront</button>
          </Link>
        </div>
      </section>

      <Feature />

      <Newsletter />
    </>
  )
}
