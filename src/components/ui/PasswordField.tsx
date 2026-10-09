'use client'

import { useState } from 'react'
import { Lock, Eye, EyeOff } from 'lucide-react'
import AppButton from './AppButton'
import { textStyles } from './text-styles'

interface PasswordFieldProps {
  placeholder: string
  value: string
  onChange: (value: string) => void
  minLength?: number
  autoComplete?: string
  error?: boolean
}

export default function PasswordField({ placeholder, value, onChange, minLength, autoComplete, error }: PasswordFieldProps) {
  const [show, setShow] = useState(false)

  return (
    <div className={`flex items-center gap-2.5 bg-bg-secondary/80 border rounded-lg px-3 py-2.5 transition-colors ${
      error ? 'border-error' : 'border-border focus-within:[border-color:var(--primary)]'
    }`}>
      <span className="text-text-disabled flex-shrink-0"><Lock size={15} /></span>
      <input
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        required
        minLength={minLength}
        autoComplete={autoComplete}
        className={`flex-1 bg-transparent ${textStyles.body} text-text-primary outline-none placeholder:text-text-disabled`}
      />
      <AppButton
        type="button"
        variant="ghost"
        size="xs"
        onClick={() => setShow(s => !s)}
        className="p-0 text-text-disabled hover:text-text-secondary hover:bg-transparent"
      >
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
      </AppButton>
    </div>
  )
}
