import { useState, type FormEvent } from 'react'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [signedUp, setSignedUp] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setSignedUp(true)
    setEmail('')
  }

  return (
    <section className="relative my-10 flex flex-wrap items-center justify-between gap-6 overflow-hidden bg-primary px-5 py-12 sm:px-10 lg:px-20">
      {/* Flat geometry stands in for the old fashion banner photograph. */}
      <span className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full bg-white/[0.05]" />
      <span className="pointer-events-none absolute -bottom-16 left-1/3 h-40 w-40 rotate-12 bg-cta/10" />

      <div className="relative z-10">
        <h4 className="text-[22px] font-bold text-white">Stock alerts &amp; market news</h4>
        <p className="mt-1 text-sm font-medium text-white/75">
          New shops, restocks and{' '}
          <span className="font-bold text-cta">merchant offers</span> — straight to your inbox.
        </p>
      </div>
      <form className="relative z-10 flex w-full sm:w-[70%] lg:w-2/5" onSubmit={handleSubmit}>
        <label htmlFor="newsletter-email" className="sr-only">
          Your email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-[50px] w-full rounded-md rounded-r-none border border-transparent px-5 text-sm outline-none"
        />
        <button
          type="submit"
          className="whitespace-nowrap rounded-md rounded-l-none bg-cta px-[30px] py-[15px] text-sm font-bold text-primary-dark transition hover:bg-cta-hover"
        >
          {signedUp ? 'Subscribed ✓' : 'Sign Up'}
        </button>
      </form>
    </section>
  )
}
