import { Outlet, Link } from 'react-router-dom'
import { ShieldCheck, LogOut, ExternalLink } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import LogoImage from '../common/LogoImage'

export default function AdminLayout() {
  const { user, signOut } = useAuth()

  return (
    <div className="flex min-h-screen flex-col bg-ivory/40">
      {/* Top Admin Navbar */}
      <header className="sticky top-0 z-30 border-b border-sand bg-white/95 backdrop-blur shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left: Logo & Admin Badge */}
          <div className="flex items-center gap-3">
            <Link to="/admin" className="flex items-center gap-2">
              <LogoImage className="h-9 w-auto" />
            </Link>
            <span className="hidden sm:inline-block h-5 w-px bg-sand" aria-hidden="true" />
            <span className="inline-flex items-center gap-1.5 rounded-full bg-burgundy/10 px-2.5 py-0.5 text-xs font-semibold text-burgundy">
              <ShieldCheck className="h-3.5 w-3.5 text-burgundy" aria-hidden="true" />
              <span>Admin Console</span>
            </span>
          </div>

          {/* Right: User Email, Storefront Link & Sign Out */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-medium text-charcoal">{user?.email}</span>
              <span className="text-[0.6875rem] font-semibold text-emerald-700">Verified Administrator</span>
            </div>

            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-control border border-sand bg-white px-2.5 py-1.5 text-xs font-medium text-charcoal hover:bg-champagne/30 transition-colors"
              title="Open storefront in a new tab"
            >
              <ExternalLink className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
              <span className="hidden sm:inline">Storefront</span>
            </Link>

            <button
              type="button"
              onClick={() => signOut()}
              className="inline-flex items-center gap-1.5 rounded-control bg-burgundy px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-wine focus-visible:outline-gold transition-colors"
              title="Sign out of administrative console"
            >
              <LogOut className="h-3.5 w-3.5 text-champagne" aria-hidden="true" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>

      {/* Admin Footer */}
      <footer className="border-t border-sand bg-white py-4 text-center text-xs text-muted">
        <p>Vaagai Metals Traders · Secure Management Subsystem · Phase 2C Active</p>
      </footer>
    </div>
  )
}
