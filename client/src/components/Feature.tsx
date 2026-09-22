/* The tutorial's six flat PNG badges are replaced with Font Awesome glyphs —
   already loaded app-wide — so the strip carries no legacy artwork. */
const features = [
  { icon: 'fa-store', label: 'Collect in store' },
  { icon: 'fa-truck-fast', label: 'Delivery nearby' },
  { icon: 'fa-naira-sign', label: 'Prices in naira' },
  { icon: 'fa-boxes-stacked', label: 'Live stock counts' },
  { icon: 'fa-shield-halved', label: 'Verified merchants' },
  { icon: 'fa-headset', label: 'Support any day' },
]

export default function Feature() {
  return (
    <section className="bg-surface-2 px-5 py-10 sm:px-10 lg:px-20">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {features.map((f) => (
          <div
            key={f.label}
            className="flex flex-col items-center gap-3 rounded-lg border border-primary-border bg-surface px-3 py-6 text-center transition hover:border-primary"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg text-cta">
              <i className={`fa-solid ${f.icon}`} aria-hidden="true"></i>
            </span>
            <h6 className="text-[13px] font-bold leading-tight text-primary">{f.label}</h6>
          </div>
        ))}
      </div>
    </section>
  )
}
