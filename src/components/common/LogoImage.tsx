import { useState } from 'react'
import { SITE } from '../../data/site'

// Uses the supplied logo artwork unchanged. No redrawn or typeset substitute is shown if the file is missing.
export default function LogoImage({ className = 'h-11' }: { className?: string }) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <span className={`inline-flex items-center rounded-control border border-dashed border-gold px-3 text-xs text-muted ${className}`}>
        Logo file needed: public{SITE.logoSrc}
      </span>
    )
  }
  return <img src={SITE.logoSrc} alt={SITE.name} onError={() => setFailed(true)} className={`w-auto ${className}`} />
}
