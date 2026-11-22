import { type ReactNode } from 'react'
import { Navigate, useLocation, Link } from 'react-router-dom'
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Button from '../common/Button'

interface ProtectedRouteProps {
  children?: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isAdmin, isLoading, signOut } = useAuth()
  const location = useLocation()

  // 1. Loading state: Heritage ivory/burgundy spinner, zero content leak
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ivory px-4 text-center">
        <div className="relative mb-4 flex h-14 w-14 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-sand animate-pulse" />
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-burgundy border-t-gold" />
        </div>
        <p className="font-serif text-lg text-burgundy font-medium tracking-wide">
          Verifying Administrator Privileges...
        </p>
        <p className="mt-1 text-sm text-muted">Vaagai Metals Traders Secure Portal</p>
      </div>
    )
  }

  // 2. Unauthenticated: Redirect to login, saving intended destination
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  // 3. Authenticated but NOT an administrator: Access Denied screen
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ivory px-4 py-12">
        <div className="w-full max-w-md rounded-panel border border-sand bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-burgundy/10 text-burgundy">
            <ShieldAlert className="h-7 w-7 text-burgundy" aria-hidden="true" />
          </div>

          <h1 className="font-serif text-2xl font-semibold text-burgundy">
            Access Denied
          </h1>

          <p className="mt-3 text-sm text-charcoal/85">
            This account is registered, but it does not have administrator privileges.
          </p>

          <div className="mt-4 rounded-control border border-sand bg-ivory/60 p-3 text-xs text-muted">
            <span className="font-semibold text-charcoal">Logged in as:</span>{' '}
            <span className="font-mono text-burgundy">{user.email}</span>
          </div>

          <p className="mt-4 text-xs text-muted">
            Only authorized administrators of Vaagai Metals Traders may access this management portal.
          </p>

          <div className="mt-6 flex flex-col gap-2.5">
            <Button
              variant="secondary"
              onClick={() => signOut()}
              className="w-full flex items-center justify-center gap-2"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span>Sign Out & Switch Account</span>
            </Button>

            <Link
              to="/"
              className="mt-2 inline-flex items-center justify-center gap-1.5 text-sm font-medium text-burgundy hover:underline"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Return to Storefront</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // 4. Authorized Administrator: render protected content
  return <>{children}</>
}
