import type { ReactNode } from 'react'

interface AdminFormSectionProps {
  title?: string
  description?: string
  children: ReactNode
}

/** A white card for one block of form fields. Fields inside are spaced vertically. */
export function AdminFormSection({ title, description, children }: AdminFormSectionProps) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
      {(title || description) && (
        <div className="mb-3">
          {title && <h2 className="text-[15px] font-bold text-[#003153]">{title}</h2>}
          {description && <p className="mt-0.5 text-xs text-gray-500">{description}</p>}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </section>
  )
}
