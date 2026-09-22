import { useEffect, useMemo, useState } from 'react'
import { deleteUser, fetchUsers, setUserRole, type AdminUser } from '../../api/admin'
import { useAuth } from '../../context/AuthContext'
import { formatNaira as money } from '../../lib/money'

const ROLES = ['customer', 'seller', 'admin']

const roleBadge: Record<string, string> = {
  admin: 'bg-[#efe7ff] text-[#6d28d9]',
  seller: 'bg-primary-soft text-primary',
  customer: 'bg-surface-2 text-muted',
}

export default function Users() {
  const { user } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [busy, setBusy] = useState<string | null>(null)

  async function load() {
    setUsers(await fetchUsers())
  }

  useEffect(() => {
    let active = true
    fetchUsers()
      .then((u) => active && setUsers(u))
      .catch((e) => active && setError(e instanceof Error ? e.message : 'Failed to load users'))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return users
    return users.filter(
      (u) => (u.full_name ?? '').toLowerCase().includes(q) || (u.email ?? '').toLowerCase().includes(q),
    )
  }, [users, query])

  async function changeRole(id: string, role: string) {
    setBusy(id)
    setError('')
    const prev = users
    setUsers((us) => us.map((u) => (u.id === id ? { ...u, role } : u)))
    try {
      await setUserRole(id, role)
    } catch (e) {
      setUsers(prev)
      setError(e instanceof Error ? e.message : 'Failed to update role')
    } finally {
      setBusy(null)
    }
  }

  async function remove(u: AdminUser) {
    if (!confirm(`Delete ${u.email || u.full_name || 'this user'}? This permanently removes their account, cart, and orders.`)) return
    setBusy(u.id)
    setError('')
    try {
      await deleteUser(u.id)
      setUsers((us) => us.filter((x) => x.id !== u.id))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete user')
      await load()
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-primary">Customers &amp; merchants <span className="text-sm font-normal text-muted">({users.length})</span></h2>
        <input
          type="search"
          placeholder="Search name or email…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search users"
          className="w-64 rounded-md border border-primary-border px-3 py-2 text-sm outline-none focus:border-primary"
        />
      </div>

      {error && <p className="rounded bg-[#fdecec] px-3 py-2 text-sm text-accent">{error}</p>}

      <div className="overflow-x-auto rounded-xl border border-primary-border bg-surface">
        {loading ? (
          <div className="flex justify-center py-16">
            <i className="fa-solid fa-spinner fa-spin text-2xl text-primary"></i>
          </div>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-primary-border bg-surface-2 text-left text-xs font-bold uppercase tracking-wide text-primary">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3">Spent</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const self = u.id === user?.id
                return (
                  <tr key={u.id} className="border-b border-primary-border last:border-0">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-ink">
                        {u.full_name || '—'} {self && <span className="text-xs text-muted">(you)</span>}
                      </div>
                      <div className="text-xs text-muted-2">{u.email ?? '—'}</div>
                    </td>
                    <td className="px-4 py-3">
                      {self ? (
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${roleBadge[u.role] ?? ''}`}>
                          {u.role}
                        </span>
                      ) : (
                        <select
                          value={u.role}
                          disabled={busy === u.id}
                          onChange={(e) => changeRole(u.id, e.target.value)}
                          aria-label="Change role"
                          className="rounded-md border border-primary-border bg-surface px-2 py-1 text-xs capitalize outline-none focus:border-primary"
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink">{u.orders}</td>
                    <td className="px-4 py-3 text-ink">{money(u.spent)}</td>
                    <td className="px-4 py-3 text-muted">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => remove(u)}
                        disabled={self || busy === u.id}
                        className="font-semibold text-accent hover:underline disabled:cursor-not-allowed disabled:text-muted-2 disabled:no-underline"
                        title={self ? 'You cannot delete your own account' : 'Delete user'}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-14 text-center">
                    {/* No EreMarket customer illustration was supplied, so this
                        empty state is type and an icon rather than artwork. */}
                    <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-2xl text-primary">
                      <i className="fa-solid fa-user-group" aria-hidden="true"></i>
                    </span>
                    <p className="font-bold text-primary">No one matches that search</p>
                    <p className="mt-1 text-sm text-muted">Customers and merchants appear here as they register.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
