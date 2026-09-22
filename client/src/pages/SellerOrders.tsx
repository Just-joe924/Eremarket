import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listSellerOrders, updateItemStatus, type SellerOrder } from '../api/sellerOrders'
import { formatNaira } from '../lib/money'

const STATUSES = ['processing', 'shipped', 'delivered', 'cancelled']

const statusColor: Record<string, string> = {
  processing: 'bg-cta-soft text-cta-ink',
  shipped: 'bg-[#d1e8f2] text-[#0b6ba8]',
  delivered: 'bg-primary-soft text-primary',
  cancelled: 'bg-[#fdecec] text-accent',
}

export default function SellerOrders() {
  const [orders, setOrders] = useState<SellerOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    listSellerOrders()
      .then((o) => active && setOrders(o))
      .catch((e) => active && setError(e instanceof Error ? e.message : 'Failed to load orders'))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  async function changeStatus(itemId: string, status: string) {
    // optimistic
    setOrders((prev) =>
      prev.map((o) => ({
        ...o,
        items: o.items.map((it) => (it.id === itemId ? { ...it, status } : it)),
      })),
    )
    try {
      await updateItemStatus(itemId, status)
    } catch {
      // reload on failure to resync
      setOrders(await listSellerOrders())
    }
  }

  if (loading) {
    return (
      <section className="section-x flex min-h-[50vh] items-center justify-center">
        <i className="fa-solid fa-spinner fa-spin text-3xl text-primary"></i>
      </section>
    )
  }

  return (
    <>
      <section className="page-banner">
        <div className="banner-rule" />
        <h2>Orders</h2>
        <p>Fulfil the orders placed against your inventory.</p>
      </section>

      <section className="section-x bg-surface-2">
        <div className="mb-6 flex items-center gap-4">
          <Link to="/seller" className="text-sm font-bold text-primary hover:underline">
            ← Back to inventory
          </Link>
        </div>

        {error && <p className="mb-4 rounded bg-[#fdecec] px-3 py-2 text-sm text-accent">{error}</p>}

        {orders.length === 0 ? (
          <div className="empty-state">
            <img src="/assets/images/empty-orders.svg" alt="" aria-hidden="true" />
            <h4>No orders yet</h4>
            <p>
              Orders containing your products will appear here, with the buyer's details and a
              status you can update.
            </p>
            <Link to="/seller">
              <button className="btn-primary">Back to inventory</button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(({ order, items }) => {
              const ship = (order.shipping_address ?? {}) as Record<string, string>
              return (
                <div key={order.id} className="rounded-lg border border-primary-border bg-surface p-5">
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-primary-border pb-3">
                    <div>
                      <p className="font-bold text-primary">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-muted-2">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${order.fulfilment === 'pickup' ? 'bg-primary-soft text-primary' : 'bg-[#d1e8f2] text-[#0b6ba8]'}`}>
                          <i className={`fa-solid ${order.fulfilment === 'pickup' ? 'fa-store' : 'fa-truck'} mr-1`}></i>
                          {order.fulfilment === 'pickup' ? 'Collecting in store' : 'Delivery'}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${order.payment_method === 'pickup' ? 'bg-cta-soft text-cta-ink' : 'bg-[#e9f9ef] text-[#059669]'}`}>
                          {order.payment_method === 'pickup' ? 'Collect payment on handover' : 'Paid online'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right text-xs text-muted">
                      <p className="font-semibold text-ink">{ship.full_name ?? '—'}</p>
                      {ship.phone && <p>{ship.phone}</p>}
                      {ship.email && <p>{ship.email}</p>}
                      {order.fulfilment === 'delivery' && (
                        <p>{[ship.address, ship.city, ship.state].filter(Boolean).join(', ')}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {items.map((it) => (
                      <div key={it.id} className="flex flex-wrap items-center gap-3">
                        <img
                          src={it.image_url ?? 'https://placehold.co/48x48?text=No+Img'}
                          alt={it.name}
                          className="h-12 w-12 rounded border border-primary-border object-cover"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-ink">{it.name}</p>
                          <p className="text-xs text-muted-2">
                            Qty {it.quantity}
                            {it.size && ` · ${it.size}`} · {formatNaira(it.price_at_purchase)}
                          </p>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor[it.status] ?? ''}`}>
                          {it.status}
                        </span>
                        <select
                          value={it.status}
                          onChange={(e) => changeStatus(it.id, e.target.value)}
                          aria-label={`Update status for ${it.name}`}
                          className="rounded-md border border-primary-border bg-surface px-2 py-1.5 text-sm outline-none focus:border-primary"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </>
  )
}
