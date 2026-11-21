import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useScroll } from 'motion/react'

export default function BackToTop() {
  const [visible, setVisible] = useState(false)
  const { scrollY } = useScroll()

  useEffect(() => {
    return scrollY.on('change', y => {
      setVisible(y > 450)
    })
  }, [scrollY])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={scrollToTop}
          aria-label="Back to top"
          initial={{ opacity: 0, y: 10, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.94, transition: { duration: 0.15 } }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="fixed bottom-6 right-6 z-40 grid h-11 w-11 place-items-center rounded-full border border-sand bg-white text-burgundy shadow-md transition-colors hover:border-gold hover:bg-ivory focus-visible:outline-gold"
        >
          <ArrowUp className="h-5 w-5" aria-hidden="true" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
