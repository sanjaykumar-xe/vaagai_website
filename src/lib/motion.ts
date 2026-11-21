import type { Transition } from 'motion/react'

// Premium Heritage Motion Tokens
// Feel: Polished brass unveiling — smooth, confident, restrained, warm.

export const EASING = {
  default: [0.22, 1, 0.36, 1] as const, // cubic-bezier(0.22, 1, 0.36, 1)
  hover: [0.25, 1, 0.5, 1] as const,
  spring: { type: 'spring', damping: 24, stiffness: 260 } as const,
  gentleSpring: { type: 'spring', damping: 30, stiffness: 200 } as const,
}

export const DURATION = {
  micro: 0.18,
  hover: 0.3,
  reveal: 0.7,
  slow: 0.9,
  heroSequence: 1.1,
}

export const STAGGER = {
  fast: 0.05,
  default: 0.07,
  cards: 0.08,
  cap: 0.6,
}

export const TRANSITION = {
  default: {
    duration: DURATION.reveal,
    ease: EASING.default,
  } satisfies Transition,
  hover: {
    duration: DURATION.hover,
    ease: EASING.hover,
  } satisfies Transition,
  micro: {
    duration: DURATION.micro,
    ease: EASING.hover,
  } satisfies Transition,
}

export const VIEWPORT_CONFIG = {
  once: true,
  margin: '-12% 0px',
} as const
