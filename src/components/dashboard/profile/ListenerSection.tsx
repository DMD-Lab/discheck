'use client'

import { Music } from 'lucide-react'
import { textStyles } from '@/components/ui/text-styles'
import type { ListenerStats } from '@/lib/insights/listener-insight'

const SIZE = 120
const STROKE = 12
const R = (SIZE - STROKE) / 2
const C = 2 * Math.PI * R

export default function ListenerSection({
  stats,
  insight,
}: {
  stats: ListenerStats
  insight: string
}) {
  const total = stats.albumFull + stats.albumPartial

  if (total === 0) {
    return (
      <section className="border border-bg-secondary rounded-lg p-5">
        <div className="mb-3">
          <h2 className={`${textStyles.cardTitle} text-text-green`}>Album vs track listener</h2>
        </div>
        <div className="min-h-[160px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-center">
            <Music size={45} className="text-text-disabled w-7 h-7 md:w-[45px] md:h-[45px]" />
            <p className={`${textStyles.caption} text-text-secondary max-w-[200px]`}>
              Vos habitudes d&apos;écoute s&apos;afficheront ici après quelques albums
            </p>
          </div>
        </div>
      </section>
    )
  }

  const fullDash = (stats.albumFullPct / 100) * C

  return (
    <section className="border border-bg-secondary rounded-lg p-5">
      <div className="mb-3">
        <h2 className={`${textStyles.cardTitle} text-text-green`}>Album vs track listener</h2>
        {insight && (
          <p className={`${textStyles.caption} text-text-secondary mt-1`}>{insight}</p>
        )}
      </div>

      <div className="flex items-center gap-3 pt-2 lg:flex-col lg:gap-4 xl:flex-row xl:gap-3">
        {/* Stat gauche — masquée au lg, visible sinon */}
        <div className="flex-1 flex flex-col items-center gap-0.5 lg:hidden xl:flex">
          <span className="text-xl font-bold text-text-primary leading-none">{stats.albumFullPct}%</span>
          <span className={`${textStyles.caption} text-text-secondary text-center`}>Complets</span>
          <span className={`${textStyles.caption} text-text-disabled`}>{stats.albumFull} album{stats.albumFull > 1 ? 's' : ''}</span>
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
            {stats.albumFullPct > 0 && (
              <circle
                cx={SIZE / 2} cy={SIZE / 2} r={R}
                fill="none"
                stroke="currentColor"
                className="text-text-green"
                strokeWidth={STROKE}
                strokeDasharray={`${fullDash} ${C}`}
                strokeLinecap="butt"
                transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
              />
            )}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Music size={24} className="text-text-disabled" />
          </div>
        </div>

        {/* Stat droite — masquée au lg, visible sinon */}
        <div className="flex-1 flex flex-col items-center gap-0.5 lg:hidden xl:flex">
          <span className="text-xl font-bold text-text-primary leading-none">{stats.albumPartialPct}%</span>
          <span className={`${textStyles.caption} text-text-secondary text-center`}>Partiels</span>
          <span className={`${textStyles.caption} text-text-disabled`}>{stats.albumPartial} album{stats.albumPartial > 1 ? 's' : ''}</span>
        </div>

        {/* Stats côte à côte sous le donut — uniquement au lg */}
        <div className="hidden lg:flex xl:hidden w-full items-center gap-3">
          <div className="flex-1 flex flex-col items-center gap-0.5">
            <span className="text-xl font-bold text-text-primary leading-none">{stats.albumFullPct}%</span>
            <span className={`${textStyles.caption} text-text-secondary text-center`}>Complets</span>
            <span className={`${textStyles.caption} text-text-disabled`}>{stats.albumFull} album{stats.albumFull > 1 ? 's' : ''}</span>
          </div>
          <div className="w-px h-10 bg-border flex-shrink-0" />
          <div className="flex-1 flex flex-col items-center gap-0.5">
            <span className="text-xl font-bold text-text-primary leading-none">{stats.albumPartialPct}%</span>
            <span className={`${textStyles.caption} text-text-secondary text-center`}>Partiels</span>
            <span className={`${textStyles.caption} text-text-disabled`}>{stats.albumPartial} album{stats.albumPartial > 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
