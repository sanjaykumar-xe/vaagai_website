import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { motion, type HTMLMotionProps } from 'motion/react'

type Variant = 'primary' | 'secondary' | 'light'
const base = 'inline-flex min-h-[2.75rem] items-center justify-center gap-2 rounded-control px-5 py-2.5 text-[0.95rem] font-semibold transition-colors'
const styles: Record<Variant, string> = {
  primary: 'bg-burgundy text-white hover:bg-wine',
  secondary: 'border border-burgundy/40 bg-white text-burgundy hover:bg-champagne/30',
  light: 'bg-white text-burgundy hover:bg-champagne',
}

type Props = { variant?: Variant; children: ReactNode; className?: string } & (
  | ({ href: string } & AnchorHTMLAttributes<HTMLAnchorElement> & HTMLMotionProps<'a'>)
  | ({ href?: undefined } & ButtonHTMLAttributes<HTMLButtonElement> & HTMLMotionProps<'button'>)
)

export default function Button({ variant = 'primary', className = '', children, ...rest }: Props) {
  const cls = `${base} ${styles[variant]} ${className}`
  const tapMotion = { whileTap: { scale: 0.98 }, transition: { duration: 0.1 } }

  if ('href' in rest && rest.href !== undefined) {
    return (
      <motion.a className={cls} {...tapMotion} {...(rest as HTMLMotionProps<'a'>)}>
        {children}
      </motion.a>
    )
  }
  return (
    <motion.button type="button" className={cls} {...tapMotion} {...(rest as HTMLMotionProps<'button'>)}>
      {children}
    </motion.button>
  )
}
