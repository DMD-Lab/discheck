'use client'

import { useState } from 'react'
import { BarChart2 } from 'lucide-react'
import { textStyles } from '@/components/ui/text-styles'
import type { CritiqueStats } from '@/lib/insights/critique-insight'
import { getCritiqueInsight } from '@/lib/insights/critique-insight'
import { RATING_COLORS } from '@/lib/rating-colors'

type Mode = 'albums' | 'tracks'

export default function CritiqueSection({ stats }: { stats: CritiqueStats }) {
  const [mode, setMode] = useState<Mode>('albums')

  const current = stats[mode]
  const insight = getCritiqueInsight(current, mode)
  const isEmpty = stats.albums.total === 0 && stats.tracks.total === 0

  if (isEmpty) {
    return (
      <section className="border border-bg-secondary rounded-lg p-5">
        <div className="mb-3">
          <h2 className={`${textStyles.cardTitle} text-text-green`}>Profil critique</h2>
        </div>
        <div className="min-h-[160px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-center">
            <BarChart2 size={45} className="text-text-disabled w-7 h-7 md:w-[45px] md:h-[45px]" />
            <p className={`${textStyles.caption} text-text-secondary max-w-[200px]`}>
              Tes notes s&apos;afficheront ici après avoir noté quelques titres ou albums
            </p>
          </div>
        </div>
      </section>
    )
  }

  const maxCount = Math.max(...([1, 2, 3, 4, 5] as const).map(r => current.distribution[r]))

  return (
    <section className="border border-bg-secondary rounded-lg p-5">
      <div className="flex items-center justify-between mb-1">
        <h2 className={`${textStyles.cardTitle} text-text-green`}>Profil critique</h2>
        <div className="flex items-center gap-0.5 bg-bg-tertiary rounded-full p-0.5">
          {(['albums', 'tracks'] as const).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                mode === m
                  ? 'bg-bg-primary text-text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {m === 'albums' ? 'Albums' : 'Tracks'}
            </button>
          ))}
        </div>
      </div>

      {insight && (
        <p className={`${textStyles.caption} text-text-secondary mt-1 mb-4`}>{insight}</p>
      )}

      {current.total === 0 ? (
        <div className="flex items-center justify-center min-h-[100px]">
          <p className={`${textStyles.caption} text-text-disabled`}>
            Aucune note {mode === 'albums' ? "d'album" : 'de track'} pour l&apos;instant
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <div className="w-3/5 flex flex-col gap-2">
            {([5, 4, 3, 2, 1] as const).map(rating => {
              const count = current.distribution[rating]
              const pct = Math.round((count / current.total) * 100)
              const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0

              return (
                <div key={rating} className="flex items-center gap-2">
                  <span className={`${textStyles.caption} text-text-disabled w-3 text-right flex-shrink-0`}>
                    {rating}
                  </span>
                  <div className="flex-1 h-2 bg-bg-tertiary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${barWidth}%`, backgroundColor: RATING_COLORS[rating] }}
                    />
                  </div>
                  <span className={`${textStyles.caption} text-text-secondary w-8 text-right flex-shrink-0`}>
                    {pct}%
                  </span>
                </div>
              )
            })}
          </div>

          <div className="flex-1 flex flex-col items-center justify-center gap-0.5 pl-4 border-l border-border">
            <span className="text-2xl font-bold text-text-primary leading-none tabular-nums">
              {current.average.toFixed(2).replace('.', ',')}
            </span>
            <span className={`${textStyles.caption} text-text-secondary text-center`}>
              Note moy.
            </span>
            <span className={`${textStyles.caption} text-text-disabled text-center mt-0.5`}>
              {current.total} note{current.total > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}
    </section>
  )
}
