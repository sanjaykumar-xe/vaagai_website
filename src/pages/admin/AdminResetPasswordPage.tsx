import { useState, useEffect, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { KeyRound, Mail, ArrowLeft, AlertCircle, CheckCircle2, Loader2, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import LogoImage from '../../components/common/LogoImage'
import Button from '../../components/common/Button'

export default function AdminResetPasswordPage() {
  const { resetPasswordForEmail, updatePassword, refreshAdminStatus } = useAuth()
  const navigate = useNavigate()

  // Track authentication flow type: 'invite' | 'recovery' | 'request'
  const [flowType, setFlowType] = useState<'invite' | 'recovery' | 'request'>('request')
  const [isRecoveryMode, setIsRecoveryMode] = useState(false)
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'warning'
    text: string
  } | null>(null)

  useEffect(() => {
    // 1. Inspect URL hash for Supabase callback parameters and errors
    const hash = window.location.hash
    if (hash) {
      const cleanHash = hash.replace(/^#/, '')
      const params = new URLSearchParams(cleanHash)

      const error = params.get('error')
      const errorCode = params.get('error_code')
      const errorDescription = params.get('error_description')
      const type = params.get('type')
      const hasAccessToken = Boolean(params.get('access_token'))

      if (error || errorCode) {
        if (errorCode === 'otp_expired') {
          setStatusMessage({
            type: 'error',
            text: 'This invitation or password recovery link is invalid or has expired. Please contact your primary administrator to resend the invitation, or request a password reset below.',
          })
        } else {
          setStatusMessage({
            type: 'error',
            text: errorDescription
              ? decodeURIComponent(errorDescription.replace(/\+/g, ' '))
              : 'The authentication link could not be verified. Please try again.',
          })
        }
        setIsRecoveryMode(false)
        setFlowType('request')
      } else if (type === 'invite') {
        setFlowType('invite')
        setIsRecoveryMode(true)
      } else if (type === 'recovery' || hasAccessToken) {
        setFlowType('recovery')
        setIsRecoveryMode(true)
      }
    }

    // 2. Listen for Supabase password recovery event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setFlowType('recovery')
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

  // Handler for setting a new password (both for invite setup and password recovery)
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
      // Re-verify administrator role privileges against authoritative RPC
      const isNowAdmin = await refreshAdminStatus()

      if (isNowAdmin) {
        setStatusMessage({
          type: 'success',
          text:
            flowType === 'invite'
              ? 'Your administrator password has been set successfully! Redirecting to the management portal...'
              : 'Your password has been updated successfully! Redirecting to the management portal...',
        })
        setTimeout(() => {
          navigate('/admin', { replace: true })
        }, 1800)
      } else {
        // Password updated, but role is not yet elevated in public.user_roles
        setStatusMessage({
          type: 'warning',
          text: 'Your password has been saved successfully, but this account has not yet been assigned administrator privileges in the database. Please contact the primary administrator to finalize your access in user_roles.',
        })
      }
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
        {isRecoveryMode && flowType === 'invite' && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-burgundy">
            <ShieldCheck className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
            <span>Invitation Setup</span>
          </span>
        )}
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
              {isRecoveryMode
                ? flowType === 'invite'
                  ? 'Set Your Administrator Password'
                  : 'Reset Your Password'
                : 'Password Recovery'}
            </h1>
            <p className="mt-1 text-xs text-champagne/90">
              {isRecoveryMode && flowType === 'invite'
                ? 'Vaagai Metals Traders — Administrator Portal Setup'
                : 'Vaagai Metals Traders Secure Password Reset'}
            </p>
          </div>

          <div className="p-6 sm:p-8">
            {statusMessage && (
              <div
                role="alert"
                className={`mb-6 flex items-start gap-3 rounded-control border p-3.5 text-xs sm:text-sm leading-relaxed ${
                  statusMessage.type === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : statusMessage.type === 'warning'
                    ? 'border-amber-200 bg-amber-50 text-amber-900'
                    : 'border-red-200 bg-red-50 text-red-800'
                }`}
              >
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
                ) : (
                  <AlertCircle
                    className={`mt-0.5 h-5 w-5 shrink-0 ${
                      statusMessage.type === 'warning' ? 'text-amber-600' : 'text-red-600'
                    }`}
                    aria-hidden="true"
                  />
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
              // Mode B: Set New Password (for Invitation or Recovery)
              <form onSubmit={handleUpdatePassword} className="space-y-4" noValidate>
                <p className="text-xs text-charcoal/80 leading-relaxed">
                  {flowType === 'invite'
                    ? 'Welcome to Vaagai Metals Traders. Create a strong password (minimum 8 characters) to access the administrator portal.'
                    : 'Enter and confirm your new administrator password (minimum 8 characters).'}
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
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
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
                        <span>Saving Password...</span>
                      </span>
                    ) : (
                      <span>{flowType === 'invite' ? 'Set Password & Continue' : 'Save New Password'}</span>
                    )}
                  </Button>
                </div>

                {statusMessage?.type === 'warning' && (
                  <div className="pt-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => navigate('/admin/login')}
                      className="w-full justify-center"
                    >
                      <span>Proceed to Admin Login</span>
                    </Button>
                  </div>
                )}
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
