import { MotionConfig } from 'motion/react'
import { LanguageProvider } from './i18n/LanguageContext'
import { ToastProvider } from './components/common/Toast'
import HomePage from './pages/HomePage'

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <LanguageProvider>
        <ToastProvider>
          <HomePage />
        </ToastProvider>
      </LanguageProvider>
    </MotionConfig>
  )
}
