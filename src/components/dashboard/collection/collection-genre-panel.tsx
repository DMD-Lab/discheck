import Image from 'next/image'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { textStyles } from '@/components/ui/text-styles'
import type { CollectionGenreData, CollectionGenreStat } from './CollectionGenreSection'

function DeltaBadge({ pctChange }: { pctChange: number | null }) {
  if (pctChange === null) return <span className={`${textStyles.caption} text-text-disabled`}>—</span>
  const positive = pctChange >= 0
  return (
    <div className={`flex items-center gap-0.5 ${positive ? 'text-text-green' : 'text-red-400'}`}>
      {positive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
      <span className={`${textStyles.caption} font-semibold tabular-nums`}>{Math.abs(pctChange)}%</span>
    </div>
  )
}

function GenreRow({ genre, rank }: { genre: CollectionGenreStat; rank: number }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <span className={`${textStyles.caption} text-text-disabled w-5 text-right flex-shrink-0`}>{rank}</span>
      <div
        className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"
        style={{ boxShadow: `0 4px 14px ${genre.color}70` }}
      >
        <Image
          src={`/genre/${genre.genreId}.png`}
          alt={genre.name}
          fill
          className="object-cover object-center"
          sizes="40px"
        />
        <div className="absolute inset-0" style={{ backgroundColor: `${genre.color}50` }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`${textStyles.body} font-medium text-text-primary`}>{genre.name}</p>
      </div>
      <div className="w-16 flex flex-col items-end flex-shrink-0">
        <span className={`${textStyles.statSm} text-text-primary tabular-nums`}>
          {genre.count.toLocaleString('fr-FR')}
        </span>
        <span className={`${textStyles.caption} text-text-secondary`}>tracks</span>
      </div>
      <div className="w-12 flex justify-center flex-shrink-0">
        <DeltaBadge pctChange={genre.pctChange} />
      </div>
    </div>
  )
}

export default function CollectionGenrePanel({ data }: { data: CollectionGenreData }) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-border flex-shrink-0 pr-12">
        <h2 className={`${textStyles.sectionTitle} text-text-green`}>Tous les genres</h2>
        <p className={`${textStyles.caption} text-text-secondary mt-1`}>
          {data.all.length} genre{data.all.length > 1 ? 's' : ''} écouté{data.all.length > 1 ? 's' : ''}
        </p>
      </div>
      <div className="flex-1 overflow-y-auto px-5">
        <div className="flex flex-col divide-y divide-border">
          {data.all.map((genre, i) => (
            <GenreRow key={genre.genreId} genre={genre} rank={i + 1} />
          ))}
        </div>
      </div>
    </div>
  )
}
