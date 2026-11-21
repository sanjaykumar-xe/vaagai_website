import type { ReactNode } from 'react'

export default function SectionHeading({ title, desc, action, id }: { title: string; desc?: string; action?: ReactNode; id?: string }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-xl">
        <h2 id={id} className="section-title">{title}</h2>
        {desc && <p className="mt-2 text-muted">{desc}</p>}
      </div>
      {action}
    </div>
  )
}
