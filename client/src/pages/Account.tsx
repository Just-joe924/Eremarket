import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchOrders } from '../api/orders'
import OrderTracker from '../components/OrderTracker'
import { formatNaira } from '../lib/money'
import type { Order } from '../types'

const statusColor: Record<string, string> = {
  pending: 'bg-cta-soft text-cta-ink',
  paid: 'bg-primary-soft text-primary',
  shipped: 'bg-[#d1e8f2] text-[#1d6f8b]',
  delivered: 'bg-[#cdebbc] text-[#3d7a1f]',
  cancelled: 'bg-[#fdecec] text-accent',
}

const itemStatusColor: Record<string, string> = {
  processing: 'bg-cta-soft text-cta-ink',
  shipped: 'bg-[#d1e8f2] text-[#1d6f8b]',
  delivered: 'bg-[#cdebbc] text-[#3d7a1f]',
  cancelled: 'bg-[#fdecec] text-accent',
}

export default function Account() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    let active = true
    fetchOrders(user.id)
      .then((data) => active && setOrders(data))
      .catch((err) => console.error('Failed to load orders:', err))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [user])

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <>
      <section className="page-banner">
        <div className="banner-rule" />
        <h2>My account</h2>
        <p>Manage your profile and track every order you've placed.</p>
      </section>

      <section className="section-x grid grid-cols-1 gap-8 bg-surface-2 lg:grid-cols-3">
        <aside className="h-fit rounded-lg border border-primary-border bg-surface p-6">
          <h3 className="mb-4 text-lg font-bold text-primary">Profile</h3>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-muted-2">Name</dt>
              <dd className="font-semibold text-ink">{profile?.full_name || '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-2">Email</dt>
              <dd className="font-semibold text-ink">{user?.email}</dd>
            </div>
            <div>
              <dt className="text-muted-2">Member since</dt>
              <dd className="font-semibold text-ink">
                {profile ? new Date(profile.created_at).toLocaleDateString() : '—'}
              </dd>
            </div>
          </dl>
          <button onClick={handleSignOut} className="btn-normal mt-6 w-full">
            Sign out
          </button>
        </aside>

        <div className="lg:col-span-2">
          <h3 className="mb-4 text-lg font-bold text-primary">Order history</h3>
          {loading ? (
            <p className="text-muted">Loading orders…</p>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <img src="/assets/images/empty-orders.svg" alt="" aria-hidden="true" />
              <h4>No orders yet</h4>
              <p>Once you order from a shop, it shows up here with its collection details.</p>
              <Link to="/shop">
                <button className="btn-primary">Start shopping</button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="rounded-lg border border-primary-border bg-surface p-5">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-sm font-bold text-primary">#{order.id.slice(0, 8)}</span>
                      <span className="ml-3 text-xs text-muted-2">
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                        statusColor[order.status] ?? 'bg-header text-ink'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <ul className="mb-4 divide-y divide-primary-border">
                    {(order.order_items ?? []).map((item) => (
                      <li key={item.id} className="flex items-center gap-3 py-2">
                        {item.products?.image_url && (
                          <img
                            src={item.products.image_url}
                            alt={item.products.name}
                            className="h-10 w-10 rounded object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <span className="text-sm">{item.products?.name ?? 'Product'}</span>
                          {item.size && <span className="block text-xs text-muted-2">{item.size}</span>}
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                            itemStatusColor[item.status ?? 'processing'] ?? 'bg-header text-ink'
                          }`}
                        >
                          {item.status ?? 'processing'}
                        </span>
                        <span className="text-xs text-muted-2">×{item.quantity}</span>
                        <span className="text-sm font-semibold text-primary">
                          {formatNaira(item.price_at_purchase)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mb-4 rounded-lg bg-surface-2 px-4 py-4">
                    <OrderTracker items={order.order_items ?? []} />
                  </div>

                  <div className="text-right text-sm font-bold text-ink">
                    Total: {formatNaira(order.total_amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
