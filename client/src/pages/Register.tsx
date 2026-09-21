import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setNotice('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setSubmitting(true)
    try {
      const hasSession = await signUp(email, password, fullName)
      if (hasSession) {
        navigate('/', { replace: true })
      } else {
        // Email confirmation is enabled on the project.
        setNotice('Account created! Check your email to confirm, then sign in.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="section-x flex min-h-[70vh] items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-lg border border-primary-border bg-surface p-8"
      >
        <h2 className="mb-2 text-3xl font-bold text-primary">Create account</h2>
        <p className="mb-6 text-sm text-muted">Join EreMarket and order from shops near you.</p>

        {error && (
          <p className="mb-4 rounded bg-[#fdecec] px-3 py-2 text-sm text-accent">{error}</p>
        )}
        {notice && (
          <p className="mb-4 rounded bg-primary-soft px-3 py-2 text-sm text-primary">{notice}</p>
        )}

        <label htmlFor="register-name" className="form-label">Full name</label>
        <input
          id="register-name"
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="form-input mb-4"
          placeholder="Jane Doe"
        />

        <label htmlFor="register-email" className="form-label">Email</label>
        <input
          id="register-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="form-input mb-4"
          placeholder="you@example.com"
        />

        <label htmlFor="register-password" className="form-label">Password</label>
        <input
          id="register-password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="form-input mb-6"
          placeholder="At least 6 characters"
        />

        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>

        <p className="mt-5 text-center text-sm text-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </section>
  )
}
