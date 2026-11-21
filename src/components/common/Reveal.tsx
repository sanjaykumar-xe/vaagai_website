import { type ReactNode, type CSSProperties } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { EASING, DURATION, VIEWPORT_CONFIG } from '../../lib/motion'

type ElementType = 'div' | 'section' | 'article' | 'li' | 'header' | 'footer' | 'ul' | 'span' | 'p'

interface RevealProps {
  children: ReactNode
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  distance?: number
  duration?: number
  as?: ElementType
  className?: string
  style?: CSSProperties
  blur?: boolean
}

const offsets = {
  up: (d: number) => ({ y: d, x: 0 }),
  down: (d: number) => ({ y: -d, x: 0 }),
  left: (d: number) => ({ x: d, y: 0 }),
  right: (d: number) => ({ x: -d, y: 0 }),
  none: () => ({ x: 0, y: 0 }),
}

export default function Reveal({
  children,
  delay = 0,
  direction = 'up',
  distance = 12,
  duration = DURATION.reveal,
  as = 'div',
  className = '',
  style,
  blur = false,
}: RevealProps) {
  const shouldReduceMotion = useReducedMotion()
  const offset = offsets[direction](distance)

  const MotionComponent = motion[as] as typeof motion.div

  if (shouldReduceMotion) {
    return (
      <MotionComponent
        className={className}
        style={style}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={VIEWPORT_CONFIG}
        transition={{ duration: 0.2, delay }}
      >
        {children}
      </MotionComponent>
    )
  }

  return (
    <MotionComponent
      className={className}
      style={style}
      initial={{
        opacity: 0,
        ...offset,
        ...(blur ? { filter: 'blur(6px)' } : {}),
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        ...(blur ? { filter: 'blur(0px)' } : {}),
      }}
      viewport={VIEWPORT_CONFIG}
      transition={{
        duration,
        delay,
        ease: EASING.default,
      }}
    >
      {children}
    </MotionComponent>
  )
}
