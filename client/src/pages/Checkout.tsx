import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { createOrder, createCheckoutSession } from '../api/orders'
import { listPickupLocations } from '../api/sellers'
import { NIGERIAN_STATES } from '../data/nigeria'
import { formatNaira } from '../lib/money'
import type { Seller } from '../types'

type Fulfilment = 'pickup' | 'delivery'
type Payment = 'online' | 'pickup'

interface CheckoutForm {
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  fulfilment: Fulfilment
  payment: Payment
}

const EMPTY_FORM: CheckoutForm = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  fulfilment: 'pickup',
  payment: 'online',
}

const DELIVERY_FLAT: number = 0 // free for now, matching the cart page

/** Nigerian mobile numbers: 08012345678, +2348012345678, 2348012345678. */
const PHONE_RE = /^(?:\+?234|0)[789]\d{9}$/

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart()
  const navigate = useNavigate()

  const [form, setForm] = useState<CheckoutForm>(EMPTY_FORM)
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutForm, string>>>({})
  const [orderId, setOrderId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [shops, setShops] = useState<Seller[]>([])

  const total = subtotal + (form.fulfilment === 'delivery' ? DELIVERY_FLAT : 0)
  const isPickup = form.fulfilment === 'pickup'
  const payOnPickup = isPickup && form.payment === 'pickup'

  // Snapshot the item count at the moment the order is placed, since
  // placing the order clears the cart.
  const placedItemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  )

  // The shops behind the cart, so a buyer collecting knows where to go.
  const sellerIds = useMemo(
    () => items.map((i) => i.product.seller_id).filter((id): id is string => Boolean(id)),
    [items],
  )
  const sellerKey = sellerIds.join(',')

  useEffect(() => {
    if (sellerIds.length === 0) {
      setShops([])
      return
    }
    let active = true
    listPickupLocations(sellerIds)
      .then((rows) => active && setShops(rows))
      .catch(() => active && setShops([]))
    return () => {
      active = false
    }
    // sellerKey is the stable identity of sellerIds; re-running on the array
    // itself would loop on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellerKey])

  function update<K extends keyof CheckoutForm>(field: K, value: CheckoutForm[K]) {
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      // Paying on collection only makes sense if you are collecting.
      if (field === 'fulfilment' && value === 'delivery') next.payment = 'online'
      return next
    })
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  function validate(): boolean {
    const next: Partial<Record<keyof CheckoutForm, string>> = {}
    if (!form.fullName.trim()) next.fullName = 'Full name is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email'
    if (!PHONE_RE.test(form.phone.replace(/[\s-]/g, ''))) {
      next.phone = 'Enter a valid Nigerian phone number'
    }
    if (form.fulfilment === 'delivery') {
      if (!form.address.trim()) next.address = 'Address is required'
      if (!form.city.trim()) next.city = 'City is required'
      if (!form.state.trim()) next.state = 'State is required'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitError('')
    if (items.length === 0 || !validate()) return
    setSubmitting(true)

    const shipping = {
      full_name: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: form.fulfilment === 'delivery' ? form.address.trim() : '',
      city: form.fulfilment === 'delivery' ? form.city.trim() : '',
      state: form.fulfilment === 'delivery' ? form.state : '',
      country: 'Nigeria',
      fulfilment: form.fulfilment,
      payment_method: form.payment,
    }

    try {
      if (form.payment === 'online') {
        // Hand off to Paystack; the cart is cleared once payment is confirmed.
        const { url } = await createCheckoutSession(shipping)
        window.location.href = url
        return
      }
      // Pay on pickup — reserve the order immediately via the API.
      const order = await createOrder(shipping)
      setOrderId(order.id)
      await clearCart() // clears client cart state (server already cleared the DB cart)
      window.scrollTo(0, 0)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to place order')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full rounded-md border border-primary-border bg-surface px-[15px] py-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary'

  // --- Confirmation view (pay-on-pickup only; online payments land on /checkout/success) ---
  if (orderId) {
    return (
      <section className="section-x flex min-h-[60vh] flex-col items-center justify-center text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-soft">
          <i className="fa-solid fa-circle-check text-[44px] text-primary"></i>
        </span>
        <h2 className="mt-5 text-3xl font-bold text-primary">Your order is reserved</h2>
        <p className="my-3 text-muted">
          Order <strong>#{orderId.slice(0, 8).toUpperCase()}</strong> is set aside for you
          {placedItemCount > 0 ? ` (${placedItemCount} item${placedItemCount > 1 ? 's' : ''})` : ''}.
          <br />
          Pay <strong className="text-cta-ink">{formatNaira(total)}</strong> when you collect.
        </p>
        <p className="max-w-md text-sm text-muted-2">
          We've emailed you a receipt with the shop address. You can also track this order in{' '}
          <Link to="/account" className="font-semibold text-primary">
            your account
          </Link>
          .
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/shop">
            <button className="btn-primary">Continue shopping</button>
          </Link>
          <Link to="/">
            <button className="btn-outline">Back to home</button>
          </Link>
        </div>
      </section>
    )
  }

  // --- Empty cart guard ---
  if (items.length === 0) {
    return (
      <section className="section-x">
        <div className="empty-state">
          <img src="/assets/images/empty-cart.svg" alt="" aria-hidden="true" />
          <h4>Your cart is empty</h4>
          <p>Add products from a shop before heading to checkout.</p>
          <Link to="/shop">
            <button className="btn-primary">Go to shop</button>
          </Link>
        </div>
      </section>
    )
  }

  // --- Checkout form view ---
  return (
    <>
      <section className="page-banner">
        <div className="banner-rule" />
        <h2>Checkout</h2>
        <p>One last step — tell us how you'd like to get your order.</p>
      </section>

      <section className="section-x flex flex-wrap items-start gap-10 bg-surface-2">
        <form
          className="flex-1 basis-[420px] rounded-lg border border-primary-border bg-surface p-6 sm:p-8"
          onSubmit={handleSubmit}
          noValidate
        >
          <h3 className="mb-4 text-lg font-bold text-primary">Your details</h3>

          <div className="mb-4">
            <input type="text" placeholder="Full Name" value={form.fullName} onChange={(e) => update('fullName', e.target.value)} className={inputClass} />
            {errors.fullName && <small className="mt-1.5 block text-xs text-accent">{errors.fullName}</small>}
          </div>

          <div className="mb-4">
            <input type="email" placeholder="Email Address" value={form.email} onChange={(e) => update('email', e.target.value)} className={inputClass} />
            <small className="mt-1.5 block text-xs text-muted-2">Your receipt is sent here.</small>
            {errors.email && <small className="mt-1.5 block text-xs text-accent">{errors.email}</small>}
          </div>

          <div className="mb-4">
            <input type="tel" placeholder="Phone Number (e.g. 08012345678)" value={form.phone} onChange={(e) => update('phone', e.target.value)} className={inputClass} />
            {errors.phone && <small className="mt-1.5 block text-xs text-accent">{errors.phone}</small>}
          </div>

          {/* --- Delivery or pickup --- */}
          <h3 className="mb-3 mt-7 text-lg font-bold text-primary">How would you like it?</h3>
          <div className="mb-5 grid gap-3 sm:grid-cols-2">
            <OptionCard
              selected={isPickup}
              onSelect={() => update('fulfilment', 'pickup')}
              icon="fa-store"
              title="Pick up at the shop"
              subtitle="Collect from the seller in person"
            />
            <OptionCard
              selected={!isPickup}
              onSelect={() => update('fulfilment', 'delivery')}
              icon="fa-truck"
              title="Deliver to me"
              subtitle="We bring it to your address"
            />
          </div>

          {form.fulfilment === 'delivery' && (
            <>
              <div className="mb-4">
                <input type="text" placeholder="Street Address" value={form.address} onChange={(e) => update('address', e.target.value)} className={inputClass} />
                {errors.address && <small className="mt-1.5 block text-xs text-accent">{errors.address}</small>}
              </div>
              <div className="flex gap-4">
                <div className="mb-4 flex-1">
                  <input type="text" placeholder="City / Town" value={form.city} onChange={(e) => update('city', e.target.value)} className={inputClass} />
                  {errors.city && <small className="mt-1.5 block text-xs text-accent">{errors.city}</small>}
                </div>
                <div className="mb-4 flex-1">
                  <select value={form.state} onChange={(e) => update('state', e.target.value)} className={inputClass}>
                    <option value="">Select state…</option>
                    {NIGERIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {errors.state && <small className="mt-1.5 block text-xs text-accent">{errors.state}</small>}
                </div>
              </div>
            </>
          )}

          {isPickup && shops.length > 0 && (
            <div className="mb-5 rounded-md border-l-[3px] border-primary bg-primary-soft px-4 py-4">
              <p className="mb-2 text-sm font-bold text-primary">
                {shops.length === 1 ? 'Collect from' : 'Collect from these shops'}
              </p>
              <ul className="space-y-3">
                {shops.map((s) => (
                  <li key={s.id} className="text-sm">
                    <span className="font-semibold text-ink">{s.brand_name || s.business_name}</span>
                    {s.address_line ? (
                      <>
                        <br />
                        <span className="text-muted">
                          {[s.address_line, s.city, s.state].filter(Boolean).join(', ')}
                        </span>
                        {s.landmark && <span className="block text-xs text-muted-2">Close to {s.landmark}</span>}
                        {s.phone && <span className="block text-xs text-muted-2">{[s.phone, s.phone_alt].filter(Boolean).join(' · ')}</span>}
                      </>
                    ) : (
                      <span className="block text-xs text-muted-2">
                        This seller hasn't added a shop address yet — they'll contact you to arrange collection.
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* --- Payment --- */}
          <h3 className="mb-3 mt-7 text-lg font-bold text-primary">Payment</h3>
          <div className="mb-2 grid gap-3 sm:grid-cols-2">
            <OptionCard
              selected={form.payment === 'online'}
              onSelect={() => update('payment', 'online')}
              icon="fa-credit-card"
              title="Pay online now"
              subtitle="Card, bank transfer or USSD"
            />
            <OptionCard
              selected={payOnPickup}
              onSelect={() => isPickup && update('payment', 'pickup')}
              disabled={!isPickup}
              icon="fa-hand-holding-dollar"
              title="Pay on pickup"
              subtitle={isPickup ? 'Pay at the shop when you collect' : 'Only for shop pickup'}
            />
          </div>
          {form.payment === 'online' && (
            <p className="mb-2 text-xs text-muted-2">
              <i className="fa-solid fa-lock mr-1"></i>
              Secured by Paystack. You'll be redirected to complete payment.
            </p>
          )}

          {submitError && (
            <p className="mt-4 rounded bg-[#fdecec] px-3 py-2 text-sm text-accent">{submitError}</p>
          )}
          <button type="submit" className="btn-primary mt-6 w-full" disabled={submitting}>
            {submitting
              ? form.payment === 'online'
                ? 'Redirecting to payment…'
                : 'Reserving your order…'
              : form.payment === 'online'
                ? `Pay ${formatNaira(total)}`
                : `Reserve Order — pay ${formatNaira(total)} on pickup`}
          </button>
        </form>

        <aside className="flex-1 basis-[320px] overflow-hidden rounded-lg border border-primary-border bg-surface lg:sticky lg:top-24">
          <h3 className="bg-primary px-[26px] py-4 text-base font-bold uppercase tracking-wide text-white">
            Order summary
          </h3>
          <div className="p-[26px]">
          <ul className="mb-4">
            {items.map((item) => (
              <li key={`${item.product.id}__${item.size}`} className="flex items-center gap-3 border-b border-primary-border py-2.5 last:border-0">
                <img className="h-[50px] w-[50px] rounded-md border border-primary-border object-cover" src={item.product.image_url ?? ''} alt={item.product.name} />
                <div className="flex flex-1 flex-col">
                  <span className="text-[13px] font-semibold text-ink">{item.product.name}</span>
                  <span className="text-xs text-muted-2">
                    Qty: {item.quantity}
                    {item.size && ` · ${item.size}`}
                  </span>
                </div>
                <span className="text-[13px] font-bold text-primary">
                  {formatNaira(item.product.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <table className="mb-[18px] w-full border-collapse">
            <tbody className="text-sm">
              <tr>
                <td className="py-2">Subtotal</td>
                <td className="py-2 text-right">{formatNaira(subtotal)}</td>
              </tr>
              <tr>
                <td className="py-2">{isPickup ? 'Pickup' : 'Delivery'}</td>
                <td className="py-2 text-right">
                  {isPickup ? 'Free' : DELIVERY_FLAT === 0 ? 'Free' : formatNaira(DELIVERY_FLAT)}
                </td>
              </tr>
              <tr className="text-base">
                <td className="border-t border-primary-border pt-3"><strong>Total</strong></td>
                <td className="border-t border-primary-border pt-3 text-right"><strong className="text-primary">{formatNaira(total)}</strong></td>
              </tr>
            </tbody>
          </table>
          {payOnPickup && (
            <p className="mb-4 rounded border-l-[3px] border-cta bg-cta-soft px-3 py-2 text-xs font-semibold text-cta-ink">
              You'll pay {formatNaira(total)} at the shop. We'll hold your items until you collect.
            </p>
          )}
          <button
            type="button"
            className="btn-normal w-full"
            onClick={() => navigate('/cart')}
          >
            Back to cart
          </button>
          </div>
        </aside>
      </section>
    </>
  )
}

/** A selectable card used for the delivery and payment choices. */
function OptionCard({
  selected,
  onSelect,
  icon,
  title,
  subtitle,
  disabled = false,
}: {
  selected: boolean
  onSelect: () => void
  icon: string
  title: string
  subtitle: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      className={`flex items-start gap-3 rounded-md border-2 p-4 text-left transition ${
        disabled
          ? 'cursor-not-allowed border-primary-border opacity-50'
          : selected
            ? 'border-primary bg-primary-soft'
            : 'border-primary-border hover:border-primary'
      }`}
    >
      <i className={`fa-solid ${icon} mt-0.5 text-lg ${selected ? 'text-primary' : 'text-muted-2'}`}></i>
      <span className="flex-1">
        <span className="block text-sm font-bold text-ink">{title}</span>
        <span className="block text-xs text-muted-2">{subtitle}</span>
      </span>
    </button>
  )
}
