'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

export type PeriodType = '30d' | '3m' | '1y' | 'all'

const PERIODS: { value: PeriodType; label: string }[] = [
  { value: '30d', label: '30 jours' },
  { value: '3m', label: '3 mois' },
  { value: '1y', label: '1 an' },
  { value: 'all', label: 'Tout' },
]

export default function PeriodSelector({ current }: { current: PeriodType }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function handleSelect(period: PeriodType) {
    const params = new URLSearchParams(searchParams.toString())
    if (period === '30d') {
      params.delete('period')
    } else {
      params.set('period', period)
    }
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname)
  }

  return (
    <div className="flex items-center gap-0.5 bg-bg-tertiary rounded-full p-0.5">
      {PERIODS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => handleSelect(value)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            current === value
              ? 'bg-bg-primary text-text-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
