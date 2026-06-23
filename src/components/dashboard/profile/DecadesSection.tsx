'use client'

import { useState } from 'react'
import { Music } from 'lucide-react'
import InfoTooltip from '@/components/ui/InfoTooltip'
import { textStyles } from '@/components/ui/text-styles'
import type { DecadeStats } from '@/lib/insights/decade-insight'

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
          <div className="flex items-center gap-2">
            <h2 className={`${textStyles.cardTitle} text-text-green`}>Décennies favorites</h2>
            <InfoTooltip text="Tes écoutes réparties par décennie de sortie. La hauteur des barres correspond au volume de titres écoutés par période." />
          </div>
        </div>
        <div className="min-h-[160px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-center p-6">
            <Music size={45} className="text-text-disabled w-7 h-7 md:w-[45px] md:h-[45px]" />
            <p className={`${textStyles.caption} text-text-secondary max-w-[200px]`}>
              Tes décennies favorites s&apos;afficheront ici après tes premières écoutes
            </p>
          </div>
        </div>
      </section>
    )
  }

  const max = Math.max(...decades.map(d => d.percentage))

  return (
    <section className="border border-bg-secondary rounded-lg p-5 flex flex-col">
      <div className="mb-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <h2 className={`${textStyles.cardTitle} text-text-green`}>Décennies favorites</h2>
          <InfoTooltip text="Tes écoutes réparties par décennie de sortie. La hauteur des barres correspond au volume de titres écoutés par période." />
        </div>
        {insight && (
          <p className={`${textStyles.caption} text-text-secondary mt-1`}>{insight}</p>
        )}
      </div>

      <div className="flex gap-1 lg:gap-px xl:gap-1 pt-7 h-[120px] lg:h-auto lg:flex-1 min-h-0">
        {decades.map((d) => (
          <div
            key={d.decade}
            className="flex-1 flex flex-col items-center min-h-0"
          >
            <div
              className="flex-1 relative flex items-end justify-center min-h-0 w-full"
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
                className="relative w-5 lg:w-5 xl:w-8 bg-text-green rounded-t transition-all duration-300"
                style={{
                  height: d.percentage > 0 ? `${(d.percentage / max) * 100}%` : '2px',
                  opacity: d.percentage > 0 ? 1 : 0.2,
                }}
              >
                {d.percentage > 0 && (
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-text-primary leading-none whitespace-nowrap">
                    {d.percentage}%
                  </span>
                )}
              </div>
            </div>
            <span className="flex-shrink-0 text-[10px] text-text-secondary mt-1 lg:hidden xl:block">{d.label}</span>
            <span className="flex-shrink-0 text-[10px] text-text-secondary mt-1 hidden lg:block xl:hidden">
              {d.decade >= 2000 ? `${String(d.decade).slice(2)}s` : d.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
