import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/seller', label: 'Sell' },
  { to: '/blog', label: 'Blog' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

// White on deep teal, with the orange rule marking the active destination.
const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'relative text-base font-semibold transition hover:text-cta',
    "after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:bg-cta after:transition-all after:content-[''] hover:after:w-full",
    isActive ? 'text-cta after:w-full' : 'text-white/90 after:w-0',
  ].join(' ')

const iconClass = 'text-white/90 transition hover:text-cta'

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { totalQuantity } = useCart()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    setMobileOpen(false)
    await signOut()
    navigate('/')
  }

  const close = () => setMobileOpen(false)

  return (
    <header className="sticky left-0 top-0 z-[999] flex items-center justify-between bg-primary px-5 py-4 shadow-[0_2px_10px_rgba(0,0,0,0.12)] sm:px-10 lg:px-20">
      <Link to="/" aria-label="EreMarket home">
        <img
          src="/assets/brand/logo-eremarket.png"
          alt="EreMarket"
          className="h-10 w-auto sm:h-12"
        />
      </Link>

      <nav>
        <ul
          className={`fixed right-0 top-0 z-[1000] flex h-screen w-[300px] flex-col items-start gap-0 bg-primary pl-2.5 pt-20 shadow-[0_40px_60px_rgba(0,0,0,0.18)] transition-transform duration-300 lg:static lg:h-auto lg:w-auto lg:translate-x-0 lg:flex-row lg:items-center lg:bg-transparent lg:p-0 lg:shadow-none ${
            mobileOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {navLinks.map((link) => (
            <li key={link.to} className="mb-6 px-5 lg:mb-0">
              <NavLink to={link.to} end={link.to === '/'} className={linkClass} onClick={close}>
                {link.label}
              </NavLink>
            </li>
          ))}

          {user ? (
            <>
              <li className="mb-6 px-5 lg:mb-0">
                <NavLink to="/account" className={linkClass} onClick={close}>
                  Account
                </NavLink>
              </li>
              <li className="mb-6 px-5 lg:mb-0">
                <button
                  onClick={handleSignOut}
                  className="text-base font-semibold text-white/90 transition hover:text-cta"
                >
                  Sign Out
                </button>
              </li>
            </>
          ) : (
            <li className="mb-6 px-5 lg:mb-0">
              <NavLink to="/login" className={linkClass} onClick={close}>
                Sign In
              </NavLink>
            </li>
          )}

          {user && (
            <li className="mb-6 px-5 lg:mb-0 lg:hidden">
              <NavLink to="/wishlist" className={linkClass} onClick={close}>
                Wishlist
              </NavLink>
            </li>
          )}

          {/* Desktop wishlist + bag icons */}
          {user && (
            <li className="relative mb-6 hidden px-5 lg:mb-0 lg:block">
              <Link to="/wishlist" onClick={close} className={iconClass} aria-label="Wishlist">
                <i className="fa-regular fa-heart"></i>
              </Link>
            </li>
          )}
          <li className="relative mb-6 hidden px-5 lg:mb-0 lg:block">
            <Link to="/cart" onClick={close} className={iconClass} aria-label="Cart">
              <i className="fa-solid fa-bag-shopping"></i>
              {totalQuantity > 0 && <span className="cart-count">{totalQuantity}</span>}
            </Link>
          </li>

          <button
            aria-label="Close menu"
            onClick={close}
            className="absolute left-7 top-7 text-2xl text-white lg:hidden"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </ul>
      </nav>

      <div className="flex items-center gap-4 lg:hidden">
        {user && (
          <Link to="/wishlist" className="text-2xl text-white/90" aria-label="Wishlist">
            <i className="fa-regular fa-heart"></i>
          </Link>
        )}
        <Link to="/cart" className="relative text-2xl text-white/90" aria-label="Cart">
          <i className="fa-solid fa-bag-shopping"></i>
          {totalQuantity > 0 && <span className="cart-count">{totalQuantity}</span>}
        </Link>
        <button aria-label="Open menu" onClick={() => setMobileOpen(true)} className="text-2xl text-white/90">
          <i className="fa-solid fa-outdent"></i>
        </button>
      </div>
    </header>
  )
}
