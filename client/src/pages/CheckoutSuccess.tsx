import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { verifyCheckout } from '../api/orders'
import { useCart } from '../context/CartContext'

type Status = 'verifying' | 'paid' | 'unpaid' | 'error'

export default function CheckoutSuccess() {
  const [params] = useSearchParams()
  // Paystack appends both `reference` and `trxref` to the callback URL.
  const reference = params.get('reference') ?? params.get('trxref')
  const { clearCart } = useCart()

  const [status, setStatus] = useState<Status>('verifying')
  const [orderId, setOrderId] = useState<string | undefined>()
  const [message, setMessage] = useState('')
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return // guard React 18 StrictMode double-invoke
    ran.current = true

    if (!reference) {
      setStatus('error')
      setMessage('Missing payment reference.')
      return
    }

    verifyCheckout(reference)
      .then(async (result) => {
        setOrderId(result.order_id)
        if (result.paid) {
          setStatus('paid')
          await clearCart() // sync local cart state with the server-cleared cart
        } else {
          setStatus('unpaid')
        }
      })
      .catch((err) => {
        setStatus('error')
        setMessage(err instanceof Error ? err.message : 'Verification failed')
      })
  }, [reference, clearCart])

  return (
    <section className="section-x flex min-h-[60vh] flex-col items-center justify-center text-center">
      {status === 'verifying' && (
        <>
          <i className="fa-solid fa-spinner fa-spin text-[48px] text-primary"></i>
          <p className="mt-5 text-muted">Confirming your payment…</p>
        </>
      )}

      {status === 'paid' && (
        <>
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-soft">
            <i className="fa-solid fa-circle-check text-[44px] text-primary"></i>
          </span>
          <h2 className="mt-5 text-3xl font-bold text-primary">Payment successful</h2>
          <p className="my-3 text-muted">
            {orderId && (
              <>
                Order <strong>#{orderId.slice(0, 8)}</strong> is confirmed.{' '}
              </>
            )}
            A receipt is on its way to your email.
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-3">
            <Link to="/account">
              <button className="btn-primary">View my orders</button>
            </Link>
            <Link to="/shop">
              <button className="btn-outline">Continue shopping</button>
            </Link>
          </div>
        </>
      )}

      {status === 'unpaid' && (
        <>
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-cta-soft">
            <i className="fa-solid fa-clock text-[44px] text-cta-ink"></i>
          </span>
          <h2 className="mt-5 text-3xl font-bold text-ink">Payment pending</h2>
          <p className="my-3 text-muted">
            Your payment hasn't completed yet. If you were charged, your order will update shortly.
          </p>
          <Link to="/account">
            <button className="btn-primary">Go to my orders</button>
          </Link>
        </>
      )}

      {status === 'error' && (
        <>
          <i className="fa-solid fa-circle-exclamation text-[64px] text-accent"></i>
          <h2 className="mt-5 text-3xl font-bold text-ink">Something went wrong</h2>
          <p className="my-3 text-muted">{message}</p>
          <Link to="/cart">
            <button className="btn-primary">Back to cart</button>
          </Link>
        </>
      )}
    </section>
  )
}
