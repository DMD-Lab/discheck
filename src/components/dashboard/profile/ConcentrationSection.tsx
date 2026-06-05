'use client'

import { useState } from 'react'
import { Users } from 'lucide-react'
import { textStyles } from '@/components/ui/text-styles'
import type { ConcentrationStats } from '@/lib/insights/concentration-insight'

const SIZE = 120
const STROKE = 12
const R = (SIZE - STROKE) / 2
const C = 2 * Math.PI * R

export default function ConcentrationSection({
  stats,
  insight,
}: {
  stats: ConcentrationStats
  insight: string
}) {
  const [showTooltip, setShowTooltip] = useState(false)

  if (stats.totalTracks === 0) {
    return (
      <section className="border border-bg-secondary rounded-lg p-5">
        <div className="mb-3">
          <h2 className={`${textStyles.cardTitle} text-text-green`}>Concentration d&apos;écoute</h2>
        </div>
        <div className="min-h-[160px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-center">
            <Users size={45} className="text-text-disabled w-7 h-7 md:w-[45px] md:h-[45px]" />
            <p className={`${textStyles.caption} text-text-secondary max-w-[200px]`}>
              Vos habitudes d&apos;écoute s&apos;afficheront ici après quelques artistes
            </p>
          </div>
        </div>
      </section>
    )
  }

  const top3Dash = (stats.top3Pct / 100) * C

  return (
    <section className="border border-bg-secondary rounded-lg p-5">
      <div className="mb-3 lg:min-h-[128px] xl:min-h-0 2xl:min-h-[64px]">
        <h2 className={`${textStyles.cardTitle} text-text-green`}>Concentration d&apos;écoute</h2>
        {insight && (
          <p className={`${textStyles.caption} text-text-secondary mt-1`}>{insight}</p>
        )}
      </div>

      <div className="flex items-center gap-3 pt-2 lg:flex-col lg:gap-4 xl:flex-row xl:gap-3">
        {/* Stat gauche — masquée au lg, visible sinon */}
        <div className="flex-1 flex flex-col items-center gap-0.5 lg:hidden xl:flex">
          <span className={`${textStyles.statLg} text-text-primary leading-none`}>{stats.top3Pct}%</span>
          <span className={`${textStyles.caption} text-text-secondary text-center`}>Top 3 artistes</span>
        </div>

        {/* Donut centre */}
        <div className="relative flex-shrink-0 w-24 h-24 xl:w-[120px] xl:h-[120px]">
          <svg width="100%" height="100%" viewBox={`0 0 ${SIZE} ${SIZE}`}>
            <circle
              cx={SIZE / 2} cy={SIZE / 2} r={R}
              fill="none"
              stroke="currentColor"
              className="text-bg-tertiary"
              strokeWidth={STROKE}
            />
            {stats.top3Pct > 0 && (
              <circle
                cx={SIZE / 2} cy={SIZE / 2} r={R}
                fill="none"
                stroke="currentColor"
                className="text-text-green"
                strokeWidth={STROKE}
                strokeDasharray={`${top3Dash} ${C}`}
                strokeLinecap="butt"
                transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                style={{ cursor: 'default' }}
              />
            )}
          </svg>

          {/* Tooltip top 3 */}
          {showTooltip && stats.top3Artists.length > 0 && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-bg-primary border border-border rounded-md px-3 py-2 whitespace-nowrap z-10 pointer-events-none">
              {stats.top3Artists.map((a, i) => (
                <div key={i} className="flex items-center justify-between gap-4">
                  <span className={`${textStyles.caption} text-text-secondary`}>{a.name}</span>
                  <span className={`${textStyles.caption} text-text-primary font-medium`}>{a.pct}%</span>
                </div>
              ))}
            </div>
          )}

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Users size={24} className="text-text-disabled" />
          </div>
        </div>

        {/* Stat droite — masquée au lg, visible sinon */}
        <div className="flex-1 flex flex-col items-center gap-0.5 lg:hidden xl:flex">
          <span className={`${textStyles.statLg} text-text-primary leading-none`}>{stats.totalTracks.toLocaleString('fr-FR')}</span>
          <span className={`${textStyles.caption} text-text-secondary text-center`}>tracks écoutées</span>
        </div>

        {/* Stats côte à côte sous le donut — uniquement au lg */}
        <div className="hidden lg:flex xl:hidden w-full items-center gap-3">
          <div className="flex-1 flex flex-col items-center gap-0.5">
            <span className={`${textStyles.statLg} text-text-primary leading-none`}>{stats.top3Pct}%</span>
            <span className={`${textStyles.caption} text-text-secondary text-center`}>Top 3 artistes</span>
          </div>
          <div className="w-px h-10 bg-border flex-shrink-0" />
          <div className="flex-1 flex flex-col items-center gap-0.5">
            <span className={`${textStyles.statLg} text-text-primary leading-none`}>{stats.totalTracks.toLocaleString('fr-FR')}</span>
            <span className={`${textStyles.caption} text-text-secondary text-center`}>tracks écoutées</span>
          </div>
        </div>
      </div>
    </section>
  )
}
