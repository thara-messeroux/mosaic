import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from 'react'

// Small reusable form + button building blocks shared across pages.

export function PrimaryButton({
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...rest} className={`btn btn-primary btn-block ${className}`} />
}

export function SecondaryButton({
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...rest} className={`btn btn-secondary btn-block ${className}`} />
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="section-label">{children}</p>
}

/** Static value/tag chip. */
export function Chip({ children }: { children: ReactNode }) {
  return <span className="chip">{children}</span>
}

/** Selectable chip for forms and filters. */
export function SelectableChip({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`chip chip-select ${selected ? 'is-selected' : ''}`}
    >
      {label}
    </button>
  )
}

/** Labeled field wrapper — the label is a real <label> for accessibility. */
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
    </label>
  )
}

export function TextInput({ className = '', ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...rest} className={`input ${className}`} />
}

export function TextArea({ className = '', ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...rest} className={`input textarea ${className}`} />
}
