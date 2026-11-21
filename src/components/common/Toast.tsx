import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'motion/react'

const Ctx = createContext<(msg: string) => void>(() => {})
export const useToast = () => useContext(Ctx)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState('')
  const timer = useRef<number>()
  const notify = useCallback((m: string) => {
    setMsg(m)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setMsg(''), 2600)
  }, [])
  return (
    <Ctx.Provider value={notify}>
      {children}
      <div aria-live="polite" role="status" className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4">
        <AnimatePresence>
          {msg && (
            <motion.p
              key={msg}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4, transition: { duration: 0.14 } }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="rounded-control bg-wine px-4 py-3 text-sm text-white shadow-lg"
            >
              {msg}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  )
}
