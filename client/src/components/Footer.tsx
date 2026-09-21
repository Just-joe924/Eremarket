import { Link } from 'react-router-dom'
import { SITE_CONTACT } from '../data/site'

const colLink = 'mb-2.5 text-[13px] text-white/75 no-underline transition hover:text-cta'
const colHead = 'mb-5 text-xs font-bold uppercase tracking-[0.14em] text-white'

export default function Footer() {
  return (
    <footer className="bg-primary px-5 py-12 text-white sm:px-10 lg:px-20">
      <div className="flex flex-wrap justify-between gap-10">
        <div className="flex max-w-[280px] flex-col items-start">
          <img
            className="mb-6 h-14 w-auto"
            src="/assets/brand/logo-eremarket.png"
            alt="EreMarket"
          />
          <h4 className={colHead}>Contact</h4>
          <p className="mb-2 text-[13px] text-white/75">
            <strong className="font-semibold text-white">Address:</strong> {SITE_CONTACT.address}
          </p>
          <p className="mb-2 text-[13px] text-white/75">
            <strong className="font-semibold text-white">Phone:</strong> {SITE_CONTACT.phone}
          </p>
          <p className="mb-2 text-[13px] text-white/75">
            <strong className="font-semibold text-white">Email:</strong> {SITE_CONTACT.email}
          </p>
          {/* Social links removed — EreMarket has no social accounts yet. Add a
              "Follow Us" block back here once the handles exist. */}
        </div>

        <div className="flex flex-col items-start">
          <h4 className={colHead}>About</h4>
          <Link to="/about" className={colLink}>About Us</Link>
          <a href="#" className={colLink}>Delivery Information</a>
          <a href="#" className={colLink}>Privacy Policy</a>
          <a href="#" className={colLink}>Terms &amp; Conditions</a>
          <Link to="/contact" className={colLink}>Contact Us</Link>
        </div>

        <div className="flex flex-col items-start">
          <h4 className={colHead}>My Account</h4>
          <Link to="/login" className={colLink}>Sign In</Link>
          <Link to="/cart" className={colLink}>View Cart</Link>
          <Link to="/wishlist" className={colLink}>My Wishlist</Link>
          <a href="#" className={colLink}>Track My Order</a>
          <a href="#" className={colLink}>Help</a>
        </div>

        <div className="flex max-w-[250px] flex-col items-start">
          <h4 className={colHead}>Sell on EreMarket</h4>
          <p className="mb-4 text-[13px] text-white/75">
            List your shop's stock in naira, take orders online and let buyers nearby collect in
            store.
          </p>
          <Link to="/seller/onboarding" className="btn-primary no-underline">
            Start Selling
          </Link>
          <p className="mb-2 mt-6 text-[13px] text-white/75">Payments secured by Paystack</p>
          <img
            src="/img/pay/pay.png"
            alt="Accepted payment methods"
            className="rounded bg-white/90 p-1.5"
          />
        </div>
      </div>

      <div className="mt-10 border-t border-white/15 pt-6 text-center">
        <p className="text-[13px] text-white/60">
          &copy; {new Date().getFullYear()} EreMarket. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
