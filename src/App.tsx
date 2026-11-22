import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MotionConfig } from 'motion/react'
import { LanguageProvider } from './i18n/LanguageContext'
import { ToastProvider } from './components/common/Toast'
import { AuthProvider } from './context/AuthContext'
import HomePage from './pages/HomePage'
import ProtectedRoute from './components/admin/ProtectedRoute'
import AdminLayout from './components/admin/AdminLayout'

// Lazy-load admin modules so public storefront bundle remains ultra-lightweight
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'))
const AdminResetPasswordPage = lazy(() => import('./pages/admin/AdminResetPasswordPage'))
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'))

function AdminFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory">
      <div className="h-9 w-9 animate-spin rounded-full border-3 border-burgundy border-t-gold" />
    </div>
  )
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <LanguageProvider>
        <ToastProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                {/* 1. Public Storefront (Existing Homepage — 100% untouched) */}
                <Route path="/" element={<HomePage />} />

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
                  <Route path="dashboard" element={<Navigate to="/admin" replace />} />
                  <Route path="*" element={<Navigate to="/admin" replace />} />
                </Route>

                {/* 4. Global Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </ToastProvider>
      </LanguageProvider>
    </MotionConfig>
  )
}
