'use client'

import { useState } from 'react'
import { Music } from 'lucide-react'
import { textStyles } from '@/components/ui/text-styles'
import type { DecadeStats } from '@/lib/insights/decade-insight'

const BAR_HEIGHT = 80

export default function DecadesSection({
  decades,
  insight,
}: {
  decades: DecadeStats[]
  insight: string
}) {
  const [hovered, setHovered] = useState<number | null>(null)

  if (decades.length === 0) {
    return (
      <section className="border border-bg-secondary rounded-lg p-5">
        <div className="mb-3">
          <h2 className={`${textStyles.cardTitle} text-text-green`}>Décennies favorites</h2>
        </div>
        <div className="min-h-[160px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-center p-6">
            <Music size={28} className="text-text-disabled" />
            <p className={`${textStyles.caption} text-text-secondary max-w-[200px]`}>
              Vos décennies favorites s&apos;afficheront ici après vos premières écoutes
            </p>
          </div>
        </div>
      </section>
    )
  }

  const max = Math.max(...decades.map(d => d.percentage))

  return (
    <section className="border border-bg-secondary rounded-lg p-5">
      <div className="mb-3">
        <h2 className={`${textStyles.cardTitle} text-text-green`}>Décennies favorites</h2>
        {insight && (
          <p className={`${textStyles.caption} text-text-secondary mt-1`}>{insight}</p>
        )}
      </div>

      <div className="flex items-end gap-1 pt-3">
        {decades.map((d) => (
          <div
            key={d.decade}
            className="flex-1 flex flex-col items-center"
          >
            <span className="text-[10px] font-semibold text-text-primary leading-none mb-1">
              {d.percentage > 0 ? `${d.percentage}%` : ''}
            </span>
            <div
              className="relative flex items-end"
              style={{ height: `${BAR_HEIGHT}px` }}
              onMouseEnter={() => setHovered(d.decade)}
              onMouseLeave={() => setHovered(null)}
            >
              {hovered === d.decade && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-bg-primary border border-border rounded-md px-2.5 py-1.5 whitespace-nowrap z-10 pointer-events-none">
                  <span className="text-[10px] leading-none text-text-primary">
                    {d.count.toLocaleString('fr-FR')} tracks écoutés
                  </span>
                </div>
              )}
              <div
                className="w-8 bg-text-green rounded-t transition-all duration-300"
                style={{
                  height: d.percentage > 0 ? `${(d.percentage / max) * BAR_HEIGHT}px` : '2px',
                  opacity: d.percentage > 0 ? 1 : 0.2,
                }}
              />
            </div>
            <span className="text-[10px] text-text-secondary mt-1">{d.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
