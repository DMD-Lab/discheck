import type { ReactNode } from 'react'
import { textStyles } from './text-styles'

interface FieldProps {
  icon: ReactNode
  type: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  autoComplete?: string
  minLength?: number
  maxLength?: number
  error?: boolean
}

export default function Field({ icon, type, placeholder, value, onChange, autoComplete, minLength, maxLength, error }: FieldProps) {
  return (
    <div className={`flex items-center gap-2.5 bg-bg-secondary/80 border rounded-lg px-3 py-2.5 transition-colors ${
      error ? 'border-error' : 'border-border focus-within:[border-color:var(--primary)]'
    }`}>
      <span className="text-text-disabled flex-shrink-0">{icon}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        required
        autoComplete={autoComplete}
        minLength={minLength}
        maxLength={maxLength}
        className={`flex-1 bg-transparent ${textStyles.body} text-text-primary outline-none placeholder:text-text-disabled`}
      />
    </div>
  )
}
