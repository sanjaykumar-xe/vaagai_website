import { useState, useEffect, type FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Lock, Mail, Eye, EyeOff, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import LogoImage from '../../components/common/LogoImage'
import Button from '../../components/common/Button'

export default function AdminLoginPage() {
  const { user, isAdmin, signInWithEmail, isLoading: authLoading, error: authError, clearError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  // Only redirect if authenticated AND verified as admin.
  // Authenticated non-admin accounts remain on the login page (or return to storefront)
  // and are never automatically redirected into /admin.
  const destination = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/admin'

  useEffect(() => {
    if (user && isAdmin && !authLoading) {
      navigate(destination, { replace: true })
    }
  }, [user, isAdmin, authLoading, navigate, destination])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    clearError()

    if (!email.trim() || !password) {
      setLocalError('Please enter both your email and password.')
      return
    }

    setIsSubmitting(true)
    const result = await signInWithEmail(email, password)
    setIsSubmitting(false)

    if (result.success) {
      navigate(destination, { replace: true })
    }
  }

  const displayedError = localError || authError

  return (
    <div className="flex min-h-screen flex-col justify-between bg-ivory px-4 py-8 sm:px-6 lg:px-8">
      {/* Header bar */}
      <div className="mx-auto flex w-full max-w-md items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-charcoal/80 hover:text-burgundy transition-colors">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Back to Storefront</span>
        </Link>
        <span className="rounded-full border border-sand bg-white px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-burgundy">
          Secure Subsystem
        </span>
      </div>

      {/* Main card */}
      <div className="mx-auto my-auto w-full max-w-md">
        <div className="overflow-hidden rounded-panel border border-sand bg-white shadow-xl">
          {/* Burgundy header banner with logo */}
          <div className="bg-wine px-6 py-8 text-center text-white">
            <div className="flex justify-center">
              <LogoImage className="h-12 brightness-0 invert" />
            </div>
            <h1 className="mt-4 font-serif text-2xl font-semibold text-white">
              Administrator Portal
            </h1>
            <p className="mt-1 text-xs text-champagne/90 tracking-wide">
              வாகை உலோக வர்த்தகம் — நிர்வாக அணுகல்
            </p>
          </div>

          {/* Form container */}
          <div className="p-6 sm:p-8">
            {displayedError && (
              <div
                role="alert"
                className="mb-6 flex items-start gap-3 rounded-control border border-red-200 bg-red-50/80 p-3.5 text-sm text-red-800"
              >
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
                <p className="text-xs sm:text-sm leading-relaxed">{displayedError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label
                  htmlFor="admin-email"
                  className="block text-xs font-semibold uppercase tracking-wider text-charcoal"
                >
                  Administrator Email
                </label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted">
                    <Mail className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <input
                    id="admin-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@vaagai.com"
                    className="block w-full rounded-control border border-sand bg-ivory/30 py-2.5 pl-10 pr-3.5 text-sm text-charcoal placeholder:text-muted/60 transition-colors focus:border-burgundy focus:bg-white focus:outline-none focus:ring-1 focus:ring-burgundy"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="admin-password"
                    className="block text-xs font-semibold uppercase tracking-wider text-charcoal"
                  >
                    Password
                  </label>
                  <Link
                    to="/admin/reset-password"
                    className="text-xs font-medium text-burgundy hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted">
                    <Lock className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="block w-full rounded-control border border-sand bg-ivory/30 py-2.5 pl-10 pr-10 text-sm text-charcoal placeholder:text-muted/60 transition-colors focus:border-burgundy focus:bg-white focus:outline-none focus:ring-1 focus:ring-burgundy"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted hover:text-charcoal focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting || authLoading}
                  className="w-full justify-center !py-3 font-semibold shadow-md"
                >
                  {isSubmitting || authLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Authenticating...</span>
                    </span>
                  ) : (
                    <span>Sign In to Console</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          Authorized personnel only. All administrative activities are monitored and logged.
        </p>
      </div>

      {/* Footer */}
      <div className="mx-auto w-full max-w-md text-center text-xs text-muted/70">
        © {new Date().getFullYear()} Vaagai Metals Traders. All rights reserved.
      </div>
    </div>
  )
}
