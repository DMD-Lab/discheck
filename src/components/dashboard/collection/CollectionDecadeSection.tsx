import { ArrowUp, ArrowDown } from 'lucide-react'
import { textStyles } from '@/components/ui/text-styles'
import InfoTooltip from '@/components/ui/InfoTooltip'

export type CollectionDecadeStat = {
  decade: number
  label: string
  count: number
  pctChange: number | null
}

function DeltaBadge({ pctChange }: { pctChange: number | null }) {
  if (pctChange === null)
    return <span className={`${textStyles.caption} text-text-disabled w-12 text-center`}>—</span>
  const positive = pctChange >= 0
  return (
    <div className={`flex items-center gap-0.5 w-12 justify-end ${positive ? 'text-text-green' : 'text-red-400'}`}>
      {positive ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
      <span className={`${textStyles.caption} font-semibold tabular-nums`}>{Math.abs(pctChange)}%</span>
    </div>
  )
}

export const COLLECTION_DECADES = [2020, 2010, 2000, 1990, 1980, 1970, 1960]

export default function CollectionDecadeSection({ data }: { data: CollectionDecadeStat[] }) {
  const isEmpty = data.every(d => d.count === 0)

  if (isEmpty) {
    return (
      <section className="border border-bg-secondary rounded-lg p-5 flex flex-col gap-4 h-full">
        <div className="flex items-center gap-2">
          <h2 className={`${textStyles.cardTitle} text-text-green`}>Collection par décennie</h2>
          <InfoTooltip text="Le nombre de titres écoutés par décennie de sortie. Les flèches indiquent l'évolution par rapport à la période sélectionnée." />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className={`${textStyles.caption} text-text-secondary`}>Écoute de la musique pour voir ta répartition par décennie</p>
        </div>
      </section>
    )
  }

  return (
    <section className="border border-bg-secondary rounded-lg p-5 flex flex-col gap-4 h-full">
      <div className="flex items-center gap-2 flex-shrink-0">
        <h2 className={`${textStyles.cardTitle} text-text-green`}>Collection par décennie</h2>
        <InfoTooltip text="Le nombre de titres écoutés par décennie de sortie. Les flèches indiquent l'évolution par rapport à la période sélectionnée." />
      </div>

      <div className="relative flex-1 flex flex-col">
        <div
          className="absolute top-0 bottom-0 w-px left-4"
          style={{ backgroundColor: 'var(--border-color)' }}
        />

        {data.map((d, i) => (
          <div key={d.decade} className="flex-1 flex">
            <div className="flex-shrink-0 w-8 flex justify-center items-center relative z-10">
              <div className="w-2.5 h-2.5 rounded-full border border-border bg-bg-primary" />
            </div>

            <div className={`flex-1 flex items-center gap-3 pl-3 py-2.5 2xl:py-0 ${i < data.length - 1 ? 'border-b border-border' : ''}`}>
              <span className={`flex-shrink-0 w-12 ${textStyles.body} font-semibold text-text-primary`}>
                {d.label}
              </span>

              <div className="flex-1 flex items-center justify-end gap-3">
                <div className="flex items-baseline gap-1.5">
                  <span className={`${textStyles.statSm} tabular-nums ${d.count > 0 ? 'text-text-green' : 'text-text-disabled'}`}>
                    {d.count.toLocaleString('fr-FR')}
                  </span>
                  <span className={`${textStyles.caption} text-text-secondary`}>tracks écoutés</span>
                </div>
                <DeltaBadge pctChange={d.count > 0 ? d.pctChange : null} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
