'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ArrowRight, ArrowUp, ArrowDown } from 'lucide-react'
import { textStyles } from '@/components/ui/text-styles'
import Panel from '@/components/ui/panel'
import CollectionGenrePanel from './collection-genre-panel'

export type CollectionGenreStat = {
  genreId: number
  name: string
  count: number
  pctChange: number | null
  color: string
}

export type CollectionGenreOthers = {
  count: number
  pctChange: number | null
  otherCount: number
}

export type CollectionGenreData = {
  top: CollectionGenreStat[]
  others: CollectionGenreOthers | null
  all: CollectionGenreStat[]
}

const CARD_HEIGHT = 260
const OTHERS_COLOR = '#A0A4AA'

function DeltaBadge({ pctChange, onDark = true }: { pctChange: number | null; onDark?: boolean }) {
  if (pctChange === null)
    return <span className={`${textStyles.caption} ${onDark ? 'text-white/40' : 'text-text-disabled'}`}>—</span>
  const positive = pctChange >= 0
  return (
    <div className={`flex items-center gap-0.5 ${positive ? 'text-text-green' : 'text-red-400'}`}>
      {positive ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
      <span className={`${textStyles.caption} font-semibold tabular-nums`}>{Math.abs(pctChange)}%</span>
    </div>
  )
}

function EmptySlot({ className = '' }: { className?: string }) {
  return <div className={className} style={{ height: CARD_HEIGHT }} />
}

function GenreCard({ genre, rank, className = '' }: { genre: CollectionGenreStat; rank: number; className?: string }) {
  return (
    <div
      className={`relative overflow-hidden flex flex-col justify-end ${className}`}
      style={{
        height: CARD_HEIGHT,
        borderRadius: 18,
        border: `1px solid ${genre.color}60`,
      }}
    >
      <Image
        src={`/genre/${genre.genreId}.png`}
        alt={genre.name}
        fill
        className="object-cover"
        sizes="440px"
      />
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0" style={{ backgroundColor: `${genre.color}4D` }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.9) 20%, rgba(0,0,0,0.1) 50%, transparent 70%)' }} />

      <div className="absolute top-3 left-3 z-10">
        <span
          className="flex items-center justify-center w-8 h-8 rounded text-sm font-bold text-white"
          style={{ backgroundColor: genre.color }}
        >
          {rank}
        </span>
      </div>

      <div className="relative z-10 p-4 flex flex-col gap-2">
        <p className={`${textStyles.body} font-medium text-white leading-tight`}>{genre.name}</p>
        <div className="flex flex-col gap-0.5">
          <p className={`${textStyles.statLg} text-white tabular-nums`}>
            {genre.count.toLocaleString('fr-FR')}
          </p>
          <p className={`${textStyles.caption} text-white/60`}>tracks</p>
        </div>
        <div className="h-[3px] w-full" style={{ backgroundColor: genre.color }} />
        <div
          className="flex items-center justify-center h-9 w-18 self-center rounded-full"
          style={{ background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          <DeltaBadge pctChange={genre.pctChange} />
        </div>
      </div>
    </div>
  )
}

function OthersCard({ others }: { others: CollectionGenreOthers }) {
  return (
    <div
      className="relative overflow-hidden flex flex-col justify-end"
      style={{
        height: CARD_HEIGHT,
        borderRadius: 18,
        border: `1px solid ${OTHERS_COLOR}60`,
      }}
    >
      <div className="absolute inset-0 bg-bg-tertiary" />

      <div className="absolute top-3 left-3 z-10">
        <span
          className="flex items-center justify-center w-8 h-8 rounded text-sm font-bold text-white"
          style={{ backgroundColor: OTHERS_COLOR }}
        >
          <span className="hidden md:inline lg:hidden">3</span>
          <span className="hidden lg:inline xl:hidden">4</span>
          <span className="hidden xl:inline">5</span>
        </span>
      </div>

      <div className="relative z-10 p-4 flex flex-col gap-2">
        <p className={`${textStyles.body} font-medium text-white`}>Autres</p>
        <div className="flex flex-col gap-0.5">
          <p className={`${textStyles.statLg} text-white tabular-nums`}>
            {others.count.toLocaleString('fr-FR')}
          </p>
          <p className={`${textStyles.caption} text-white/60`}>tracks</p>
        </div>
        <div className="h-[3px] w-full" style={{ backgroundColor: OTHERS_COLOR }} />
        <div
          className="flex items-center justify-center h-9 w-18 self-center rounded-full"
          style={{ background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          <DeltaBadge pctChange={others.pctChange} />
        </div>
      </div>
    </div>
  )
}

function GenreListRow({ genre, rank }: { genre: CollectionGenreStat; rank: number }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-bg-secondary last:border-0">
      <span
        className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded text-sm font-bold text-white"
        style={{ backgroundColor: genre.color }}
      >
        {rank}
      </span>
      <span className={`${textStyles.body} font-medium text-text-primary flex-1 min-w-0 truncate`}>
        {genre.name}
      </span>
      <div className="flex flex-col items-end">
        <span className={`${textStyles.statSm} text-text-primary tabular-nums`}>
          {genre.count.toLocaleString('fr-FR')}
        </span>
        <span className={`${textStyles.caption} text-text-secondary`}>tracks écoutés</span>
      </div>
      <div className="w-12 flex justify-center flex-shrink-0">
        <DeltaBadge pctChange={genre.pctChange} onDark={false} />
      </div>
    </div>
  )
}

function OthersListRow({ others }: { others: CollectionGenreOthers }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <span
        className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded text-sm font-bold text-white"
        style={{ backgroundColor: OTHERS_COLOR }}
      >
        5
      </span>
      <span className={`${textStyles.body} font-medium text-text-primary flex-1 min-w-0`}>
        Autres
      </span>
      <div className="flex flex-col items-end">
        <span className={`${textStyles.statSm} text-text-secondary tabular-nums`}>
          {others.count.toLocaleString('fr-FR')}
        </span>
        <span className={`${textStyles.caption} text-text-secondary`}>tracks écoutés</span>
      </div>
      <div className="w-12 flex justify-center flex-shrink-0">
        <DeltaBadge pctChange={others.pctChange} onDark={false} />
      </div>
    </div>
  )
}

export default function CollectionGenreSection({ data }: { data: CollectionGenreData }) {
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  if (data.top.length === 0 && !data.others) {
    return (
      <section className="border border-bg-secondary rounded-lg p-5">
        <h2 className={`${textStyles.cardTitle} text-text-green mb-3`}>Collection par genre</h2>
        <div className="h-48 flex items-center justify-center">
          <p className={`${textStyles.caption} text-text-secondary`}>Aucun genre écouté sur cette période</p>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="border border-bg-secondary rounded-lg p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className={`${textStyles.cardTitle} text-text-green`}>Collection par genre</h2>
          <button
            onClick={() => setIsPanelOpen(true)}
            className={`${textStyles.caption} text-text-primary hover:text-primary transition-colors flex items-center gap-1`}
          >
            Voir plus <ArrowRight size={12} />
          </button>
        </div>

        <div className="md:hidden flex flex-col">
          {data.top.map((genre, i) => (
            <GenreListRow key={genre.genreId} genre={genre} rank={i + 1} />
          ))}
          {data.others && <OthersListRow others={data.others} />}
        </div>

        <div className="hidden md:grid gap-3 md:[grid-template-columns:1.5fr_1fr_0.7fr] lg:[grid-template-columns:1.5fr_1fr_1fr_0.7fr] xl:[grid-template-columns:1.5fr_1fr_1fr_0.85fr_0.7fr]">
          {data.top[0] ? <GenreCard genre={data.top[0]} rank={1} /> : <EmptySlot />}
          {data.top[1] ? <GenreCard genre={data.top[1]} rank={2} /> : <EmptySlot />}
          {data.top[2]
            ? <GenreCard genre={data.top[2]} rank={3} className="md:hidden lg:flex" />
            : <EmptySlot className="md:hidden lg:block" />}
          {data.top[3]
            ? <GenreCard genre={data.top[3]} rank={4} className="md:hidden xl:flex" />
            : <EmptySlot className="md:hidden xl:block" />}
          {data.others ? <OthersCard others={data.others} /> : <EmptySlot />}
        </div>
      </section>

      <Panel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)}>
        <CollectionGenrePanel data={data} />
      </Panel>
    </>
  )
}
