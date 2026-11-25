import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { MotionConfig } from 'motion/react'
import { LanguageProvider } from './i18n/LanguageContext'
import { ToastProvider } from './components/common/Toast'
import { AuthProvider } from './context/AuthContext'
import { QuoteCartProvider } from './context/QuoteCartContext'
import HomePage from './pages/HomePage'
import ShopPage from './pages/ShopPage'
import ProductDetailPage from './pages/ProductDetailPage'
import QuoteCartPage from './pages/QuoteCartPage'
import QuoteRequestPage from './pages/QuoteRequestPage'
import QuoteSuccessPage from './pages/QuoteSuccessPage'
import NotFoundPage from './pages/NotFoundPage'
import ProtectedRoute from './components/admin/ProtectedRoute'
import AdminLayout from './components/admin/AdminLayout'

// Lazy-load admin modules so public storefront bundle remains ultra-lightweight
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'))
const AdminResetPasswordPage = lazy(() => import('./pages/admin/AdminResetPasswordPage'))
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'))
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage'))
const AdminProductNewPage = lazy(() => import('./pages/admin/AdminProductNewPage'))
const AdminProductEditPage = lazy(() => import('./pages/admin/AdminProductEditPage'))

function AdminFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory">
      <div className="h-9 w-9 animate-spin rounded-full border-3 border-burgundy border-t-gold" />
    </div>
  )
}

/**
 * App-level authentication callback interceptor.
 * Safely redirects Supabase invitation, recovery, and error callbacks
 * arriving at the root '/' or non-admin routes into '/admin/reset-password'
 * while preserving callback hash parameters, preventing redirect loops,
 * and never interfering with normal storefront navigation or page anchors.
 */
function AuthCallbackHandler() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (location.pathname !== '/admin/reset-password') {
      const hash = window.location.hash
      if (!hash) return

      const isAuthCallback =
        hash.includes('type=invite') ||
        hash.includes('type=recovery') ||
        hash.includes('error=') ||
        hash.includes('error_code=')

      if (isAuthCallback) {
        navigate(`/admin/reset-password${hash}`, { replace: true })
      }
    }
  }, [location.pathname, navigate])

  return null
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <LanguageProvider>
        <ToastProvider>
          <AuthProvider>
            <QuoteCartProvider>
              <BrowserRouter>
                <AuthCallbackHandler />
                <Routes>
                  {/* 1. Public Storefront */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/shop" element={<ShopPage />} />
                  <Route path="/products/:slug" element={<ProductDetailPage />} />
                  <Route path="/quote" element={<QuoteCartPage />} />
                  <Route path="/quote/request" element={<QuoteRequestPage />} />
                  <Route path="/quote/success" element={<QuoteSuccessPage />} />

                {/* 2. Public Admin Authentication Routes */}
                <Route
                  path="/admin/login"
                  element={
                    <Suspense fallback={<AdminFallback />}>
                      <AdminLoginPage />
                    </Suspense>
                  }
                />
                <Route
                  path="/admin/reset-password"
                  element={
                    <Suspense fallback={<AdminFallback />}>
                      <AdminResetPasswordPage />
                    </Suspense>
                  }
                />

                {/* 3. Protected Admin Portal Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route
                    index
                    element={
                      <Suspense fallback={<AdminFallback />}>
                        <AdminDashboardPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="products"
                    element={
                      <Suspense fallback={<AdminFallback />}>
                        <AdminProductsPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="products/new"
                    element={
                      <Suspense fallback={<AdminFallback />}>
                        <AdminProductNewPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="products/:id/edit"
                    element={
                      <Suspense fallback={<AdminFallback />}>
                        <AdminProductEditPage />
                      </Suspense>
                    }
                  />
                  <Route path="dashboard" element={<Navigate to="/admin" replace />} />
                  <Route path="*" element={<Navigate to="/admin" replace />} />
                </Route>

                {/* 4. Global 404 Not Found */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
              </BrowserRouter>
            </QuoteCartProvider>
          </AuthProvider>
        </ToastProvider>
      </LanguageProvider>
    </MotionConfig>
  )
}
