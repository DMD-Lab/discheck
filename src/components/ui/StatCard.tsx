import type { ReactNode } from 'react'
import { textStyles } from '@/components/ui/text-styles'

interface StatCardProps {
  icon: ReactNode
  value: string | number
  label: string
  tooltip?: string
}

export default function StatCard({ icon, value, label, tooltip }: StatCardProps) {
  return (
    <div className="relative group flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-bg-secondary/50">
      {icon}
      <div>
        <p className="text-text-primary text-base font-bold leading-none">{value}</p>
        <p className={`${textStyles.caption} text-text-disabled mt-0.5`}>{label}</p>
      </div>
      {tooltip && (
        <div className={`absolute bottom-full right-0 mb-2 px-2.5 py-1.5 bg-bg-tertiary border border-border rounded-lg ${textStyles.caption} text-text-secondary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10`}>
          {tooltip}
        </div>
      )}
    </div>
  )
}
