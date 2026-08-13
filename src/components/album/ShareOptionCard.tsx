import type { ReactNode } from 'react'
import InfoTooltip from '@/components/ui/InfoTooltip'
import { textStyles } from '@/components/ui/text-styles'

interface ShareOptionCardProps {
  title: string
  info: string
  selected: boolean
  disabled?: boolean
  disabledReason?: string
  onSelect: () => void
  children?: ReactNode
}

export default function ShareOptionCard({
  title,
  info,
  selected,
  disabled = false,
  disabledReason,
  onSelect,
  children,
}: ShareOptionCardProps) {
  return (
    <div className={`py-2.5 ${disabled ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onSelect}
          disabled={disabled}
          className={`flex items-center gap-2 text-left ${disabled ? 'cursor-not-allowed' : ''}`}
        >
          <span
            className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center ${
              selected ? 'border-primary' : 'border-text-disabled'
            }`}
          >
            {selected && <span className="w-2 h-2 rounded-full bg-primary" />}
          </span>
          <span
            className={`${textStyles.body} font-medium transition-colors ${
              disabled
                ? 'text-text-secondary'
                : selected
                  ? 'text-primary'
                  : 'text-text-primary hover:text-text-secondary'
            }`}
          >
            {title}
          </span>
        </button>
        <InfoTooltip text={info} />
      </div>

      {disabled && disabledReason && (
        <p className={`${textStyles.caption} text-text-secondary mt-1 ml-6`}>{disabledReason}</p>
      )}

      {children}
    </div>
  )
}
