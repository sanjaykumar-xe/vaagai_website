import type { Transition } from 'motion/react'

// Premium Heritage Motion Tokens
// Feel: Polished brass unveiling — smooth, confident, restrained, warm.

export const EASING = {
  default: [0.22, 1, 0.36, 1] as const, // cubic-bezier(0.22, 1, 0.36, 1)
  hover: [0.25, 1, 0.5, 1] as const,
  spring: { type: 'spring', damping: 28, stiffness: 320 } as const,
  gentleSpring: { type: 'spring', damping: 32, stiffness: 240 } as const,
}

export const DURATION = {
  micro: 0.14,
  hover: 0.20,
  transition: 0.25,
  reveal: 0.45,
  slow: 0.65,
  heroSequence: 0.60,
}

export const STAGGER = {
  fast: 0.04,
  default: 0.06,
  cards: 0.06,
  cap: 0.45,
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
