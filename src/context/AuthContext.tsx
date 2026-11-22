import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export interface AuthContextType {
  user: User | null
  session: Session | null
  isAdmin: boolean
  isLoading: boolean
  error: string | null
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  resetPasswordForEmail: (email: string) => Promise<{ success: boolean; error?: string }>
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>
  clearError: () => void
  refreshAdminStatus: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => setError(null), [])

  /**
   * Asynchronous administrator privilege verification against Supabase RPC.
   * Kept separate from onAuthStateChange callback to prevent auth deadlocks.
   */
  const checkAdminRole = useCallback(async (userId?: string): Promise<boolean> => {
    if (!userId) {
      setIsAdmin(false)
      return false
    }

    try {
      // Query authoritative public.is_admin() RPC function
      const { data, error: rpcError } = await supabase.rpc('is_admin')

      if (rpcError) {
        console.error('[Auth] Failed to verify administrator role:', rpcError.message)
        setIsAdmin(false)
        return false
      }

      const verified = Boolean(data)
      setIsAdmin(verified)
      return verified
    } catch (err) {
      console.error('[Auth] Unexpected error during role verification:', err)
      setIsAdmin(false)
      return false
    }
  }, [])

  /**
   * Initial session loading on mount
   */
  useEffect(() => {
    let isMounted = true

    async function initializeAuth() {
      try {
        const { data, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) {
          throw sessionError
        }

        if (isMounted) {
          const currentSession = data.session
          setSession(currentSession)
          setUser(currentSession?.user ?? null)

          if (currentSession?.user) {
            await checkAdminRole(currentSession.user.id)
          } else {
            setIsAdmin(false)
          }
        }
      } catch (err) {
        console.error('[Auth] Error getting initial session:', err)
        if (isMounted) {
          setSession(null)
          setUser(null)
          setIsAdmin(false)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    initializeAuth()

    return () => {
      isMounted = false
    }
  }, [checkAdminRole])

  /**
   * Subscribe to auth state changes.
   * IMPORTANT: State updates are synchronous; async database queries are scheduled
   * separately outside the callback to avoid auth lock deadlocks.
   */
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession)
        setUser(newSession?.user ?? null)

        if (event === 'SIGNED_OUT' || !newSession) {
          setIsAdmin(false)
          setIsLoading(false)
          setError(null)
          return
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          setIsLoading(true)
          // Schedule role verification outside synchronous event loop
          setTimeout(() => {
            checkAdminRole(newSession.user.id).finally(() => {
              setIsLoading(false)
            })
          }, 0)
        }
      },
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [checkAdminRole])

  /**
   * Sign in with email and password
   */
  const signInWithEmail = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    setError(null)
    setIsLoading(true)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })

      if (signInError) {
        const msg = getCleanErrorMessage(signInError)
        setError(msg)
        setIsLoading(false)
        return { success: false, error: msg }
      }

      if (data.user) {
        await checkAdminRole(data.user.id)
        setIsLoading(false)
        return { success: true }
      }

      setIsLoading(false)
      return { success: false, error: 'Sign-in failed. Please check your credentials.' }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.'
      setError(msg)
      setIsLoading(false)
      return { success: false, error: msg }
    }
  }

  /**
   * Sign out current user and clear authorization state
   */
  const signOut = async (): Promise<void> => {
    setIsLoading(true)
    try {
      await supabase.auth.signOut()
    } catch (err) {
      console.error('[Auth] Error during sign out:', err)
    } finally {
      setSession(null)
      setUser(null)
      setIsAdmin(false)
      setError(null)
      setIsLoading(false)
    }
  }

  /**
   * Request password reset email
   */
  const resetPasswordForEmail = async (
    email: string,
  ): Promise<{ success: boolean; error?: string }> => {
    setError(null)
    try {
      const redirectUrl = `${window.location.origin}/admin/reset-password`
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        { redirectTo: redirectUrl },
      )

      if (resetError) {
        const msg = getCleanErrorMessage(resetError)
        setError(msg)
        return { success: false, error: msg }
      }

      return { success: true }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to send recovery email.'
      setError(msg)
      return { success: false, error: msg }
    }
  }

  /**
   * Update password (used during password recovery flow)
   */
  const updatePassword = async (
    newPassword: string,
  ): Promise<{ success: boolean; error?: string }> => {
    setError(null)
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) {
        const msg = getCleanErrorMessage(updateError)
        setError(msg)
        return { success: false, error: msg }
      }

      return { success: true }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update password.'
      setError(msg)
      return { success: false, error: msg }
    }
  }

  const refreshAdminStatus = useCallback(async (): Promise<boolean> => {
    return checkAdminRole(user?.id)
  }, [checkAdminRole, user?.id])

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAdmin,
        isLoading,
        error,
        signInWithEmail,
        signOut,
        resetPasswordForEmail,
        updatePassword,
        clearError,
        refreshAdminStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

/**
 * Standardize user-friendly error messages without leaking security details.
 */
function getCleanErrorMessage(error: AuthError): string {
  const msg = error.message.toLowerCase()
  if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
    return 'Invalid email or password. Please verify your credentials and try again.'
  }
  if (msg.includes('email not confirmed')) {
    return 'Your email address has not been confirmed yet. Please check your inbox.'
  }
  if (msg.includes('rate limit') || msg.includes('too many requests')) {
    return 'Too many login attempts. Please wait a few moments before trying again.'
  }
  if (msg.includes('user not found')) {
    return 'Invalid email or password. Please verify your credentials and try again.'
  }
  return error.message
}
