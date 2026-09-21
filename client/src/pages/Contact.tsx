import { useState, type FormEvent } from 'react'
import Newsletter from '../components/Newsletter'
import { sendContactMessage } from '../api/contact'
import { SITE_CONTACT as OFFICE, SITE_MAP_EMBED } from '../data/site'

const inputClass =
  'mb-5 w-full rounded-md border border-primary-border bg-surface px-[15px] py-3 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary'

type Status = 'idle' | 'sending' | 'sent' | 'error'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (status !== 'sending') setStatus('idle')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.name.trim()) return setError('Please tell us your name.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError('Please enter a valid email address.')
    if (!form.message.trim()) return setError('Please write a message.')

    setStatus('sending')
    try {
      await sendContactMessage({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      })
      setStatus('sent')
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Could not send your message.')
    }
  }

  return (
    <>
      <section className="page-banner">
        <div className="banner-rule" />
        <h2>Talk to us</h2>
        <p>Questions about an order, a shop, or selling on EreMarket — we read every message.</p>
      </section>

      <section className="section-x flex flex-col items-center justify-between gap-8 lg:flex-row">
        <div className="w-full lg:w-2/5">
          <p className="eyebrow">Get in touch</p>
          <h2 className="py-4 text-[26px] font-bold leading-[35px] text-primary">
            Reach us any day of the week.
          </h2>
          <h3 className="pb-4 text-base font-bold text-ink">Head office</h3>
          <ul>
            <li className="flex items-center p-2.5">
              <i className="fa-solid fa-map pr-[22px] text-sm text-primary"></i>
              <p className="m-0 text-sm text-muted">{OFFICE.address}</p>
            </li>
            <li className="flex items-center p-2.5">
              <i className="fa-solid fa-envelope pr-[22px] text-sm text-primary"></i>
              <p className="m-0 text-sm text-muted">{OFFICE.email}</p>
            </li>
            <li className="flex items-center p-2.5">
              <i className="fa-solid fa-phone pr-[22px] text-sm text-primary"></i>
              <p className="m-0 text-sm text-muted">{OFFICE.phone}</p>
            </li>
          </ul>
        </div>
        <div className="h-[440px] w-full overflow-hidden rounded-lg border border-primary-border lg:w-[55%]">
          <iframe
            title="EreMarket location map"
            src={SITE_MAP_EMBED}
            className="h-full w-full"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </section>

      <section className="mx-auto my-[30px] max-w-3xl rounded-lg border border-primary-border bg-surface p-8 sm:p-10 lg:p-14">
        <form onSubmit={handleSubmit} className="flex w-full flex-col items-start" noValidate>
          <p className="eyebrow">Leave a message</p>
          <h2 className="py-4 text-[26px] font-bold leading-[35px] text-primary">
            We'd love to hear from you
          </h2>

          <input type="text" placeholder="Your name" value={form.name} onChange={(e) => update('name', e.target.value)} className={inputClass} />
          <input type="email" placeholder="Your email" value={form.email} onChange={(e) => update('email', e.target.value)} className={inputClass} />
          <input type="text" placeholder="Subject" value={form.subject} onChange={(e) => update('subject', e.target.value)} className={inputClass} />
          <textarea rows={10} placeholder="Your message" value={form.message} onChange={(e) => update('message', e.target.value)} className={inputClass}></textarea>

          {error && (
            <p className="mb-4 w-full rounded bg-[#fdecec] px-3 py-2 text-sm text-accent">{error}</p>
          )}
          {status === 'sent' && (
            <p className="mb-4 w-full rounded bg-primary-soft px-3 py-2 text-sm text-primary">
              <i className="fa-solid fa-circle-check mr-2"></i>
              Thanks — your message is on its way. We'll reply to your email shortly.
            </p>
          )}

          <button type="submit" className="btn-primary" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending…' : status === 'sent' ? 'Send another' : 'Submit'}
          </button>
        </form>
      </section>

      <Newsletter />
    </>
  )
}
