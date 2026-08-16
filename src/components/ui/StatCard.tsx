import type { ReactNode } from 'react'
import { textStyles } from '@/components/ui/text-styles'

interface StatCardProps {
  icon: ReactNode
  value: string | number
  label: string
}

export default function StatCard({ icon, value, label }: StatCardProps) {
  return (
    <div className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-2 bg-bg-secondary lg:bg-transparent">
      {icon}
      <div className="flex flex-col items-center w-24 flex-shrink-0">
        <span className={`${textStyles.statMd} text-text-primary tabular-nums leading-none`}>{value}</span>
        <span className={`${textStyles.caption} text-text-disabled leading-none mt-0.5`}>{label}</span>
      </div>
    </div>
  )
}
