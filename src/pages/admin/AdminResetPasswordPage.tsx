import { useState, useEffect, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { KeyRound, Mail, ArrowLeft, AlertCircle, CheckCircle2, Loader2, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import LogoImage from '../../components/common/LogoImage'
import Button from '../../components/common/Button'

export default function AdminResetPasswordPage() {
  const { resetPasswordForEmail, updatePassword } = useAuth()
  const navigate = useNavigate()

  // Detect whether visitor landed here from an email recovery link (#access_token=... or session recovery)
  const [isRecoveryMode, setIsRecoveryMode] = useState(false)
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    // Listen for recovery session or check URL hash
    const hash = window.location.hash
    if (hash && (hash.includes('type=recovery') || hash.includes('access_token='))) {
      setIsRecoveryMode(true)
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Handler for requesting password reset email
  const handleRequestReset = async (e: FormEvent) => {
    e.preventDefault()
    setStatusMessage(null)

    if (!email.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter your administrator email address.' })
      return
    }

    setIsSubmitting(true)
    const result = await resetPasswordForEmail(email)
    setIsSubmitting(false)

    if (result.success) {
      setStatusMessage({
        type: 'success',
        text: 'If an administrator account exists for this email, password recovery instructions have been sent. Please check your inbox.',
      })
      setEmail('')
    } else {
      setStatusMessage({
        type: 'error',
        text: result.error || 'Failed to send recovery email. Please try again.',
      })
    }
  }

  // Handler for setting a new password when in recovery mode
  const handleUpdatePassword = async (e: FormEvent) => {
    e.preventDefault()
    setStatusMessage(null)

    if (newPassword.length < 8) {
      setStatusMessage({ type: 'error', text: 'Password must be at least 8 characters in length.' })
      return
    }

    if (newPassword !== confirmPassword) {
      setStatusMessage({ type: 'error', text: 'Passwords do not match. Please re-enter.' })
      return
    }

    setIsSubmitting(true)
    const result = await updatePassword(newPassword)
    setIsSubmitting(false)

    if (result.success) {
      setStatusMessage({
        type: 'success',
        text: 'Your password has been successfully updated. Redirecting to administrator login...',
      })
      setTimeout(() => {
        navigate('/admin/login', { replace: true })
      }, 2500)
    } else {
      setStatusMessage({
        type: 'error',
        text: result.error || 'Failed to update password. Please request a new recovery link.',
      })
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-between bg-ivory px-4 py-8 sm:px-6 lg:px-8">
      {/* Top navigation */}
      <div className="mx-auto flex w-full max-w-md items-center justify-between">
        <Link
          to="/admin/login"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-charcoal/80 hover:text-burgundy transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Back to Admin Login</span>
        </Link>
      </div>

      {/* Main card */}
      <div className="mx-auto my-auto w-full max-w-md">
        <div className="overflow-hidden rounded-panel border border-sand bg-white shadow-xl">
          {/* Header */}
          <div className="bg-wine px-6 py-6 text-center text-white">
            <div className="flex justify-center">
              <LogoImage className="h-10 brightness-0 invert" />
            </div>
            <h1 className="mt-3 font-serif text-xl font-semibold text-white">
              {isRecoveryMode ? 'Set New Password' : 'Password Recovery'}
            </h1>
            <p className="mt-1 text-xs text-champagne/90">
              Vaagai Metals Traders Secure Password Reset
            </p>
          </div>

          <div className="p-6 sm:p-8">
            {statusMessage && (
              <div
                role="alert"
                className={`mb-6 flex items-start gap-3 rounded-control border p-3.5 text-xs sm:text-sm leading-relaxed ${
                  statusMessage.type === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-red-200 bg-red-50 text-red-800'
                }`}
              >
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
                ) : (
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
                )}
                <p>{statusMessage.text}</p>
              </div>
            )}

            {!isRecoveryMode ? (
              // Mode A: Request Reset Link
              <form onSubmit={handleRequestReset} className="space-y-4" noValidate>
                <p className="text-xs text-charcoal/80 leading-relaxed">
                  Enter your registered administrator email address and we will send you a secure link to reset your password.
                </p>

                <div>
                  <label
                    htmlFor="reset-email"
                    className="block text-xs font-semibold uppercase tracking-wider text-charcoal"
                  >
                    Administrator Email
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted">
                      <Mail className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <input
                      id="reset-email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@vaagai.com"
                      className="block w-full rounded-control border border-sand bg-ivory/30 py-2.5 pl-10 pr-3.5 text-sm text-charcoal transition-colors focus:border-burgundy focus:bg-white focus:outline-none focus:ring-1 focus:ring-burgundy"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full justify-center !py-2.5 font-semibold"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Sending Link...</span>
                      </span>
                    ) : (
                      <span>Send Recovery Link</span>
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              // Mode B: Set New Password
              <form onSubmit={handleUpdatePassword} className="space-y-4" noValidate>
                <p className="text-xs text-charcoal/80 leading-relaxed">
                  Enter and confirm your new administrator password.
                </p>

                <div>
                  <label
                    htmlFor="new-password"
                    className="block text-xs font-semibold uppercase tracking-wider text-charcoal"
                  >
                    New Password
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted">
                      <KeyRound className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="block w-full rounded-control border border-sand bg-ivory/30 py-2.5 pl-10 pr-10 text-sm text-charcoal transition-colors focus:border-burgundy focus:bg-white focus:outline-none focus:ring-1 focus:ring-burgundy"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted hover:text-charcoal"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirm-password"
                    className="block text-xs font-semibold uppercase tracking-wider text-charcoal"
                  >
                    Confirm Password
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted">
                      <KeyRound className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <input
                      id="confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="block w-full rounded-control border border-sand bg-ivory/30 py-2.5 pl-10 pr-3.5 text-sm text-charcoal transition-colors focus:border-burgundy focus:bg-white focus:outline-none focus:ring-1 focus:ring-burgundy"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full justify-center !py-2.5 font-semibold"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Updating Password...</span>
                      </span>
                    ) : (
                      <span>Save New Password</span>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-md text-center text-xs text-muted/70">
        © {new Date().getFullYear()} Vaagai Metals Traders. All rights reserved.
      </div>
    </div>
  )
}
