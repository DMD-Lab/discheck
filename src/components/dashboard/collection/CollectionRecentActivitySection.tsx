'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { textStyles } from '@/components/ui/text-styles'
import Panel from '@/components/ui/panel'
import MarqueeText from '@/components/ui/marquee-text'

export type RecentTrack = {
  trackDeezerId: number
  title: string
  artistName: string
  coverXl: string
  listenedAt: string
}

export type RecentAlbum = {
  albumDeezerId: number
  title: string
  artistName: string
  coverXl: string
  lastListenedAt: string
}

type Mode = 'tracks' | 'albums'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 60) return minutes <= 1 ? "à l'instant" : `il y a ${minutes} min`
  if (hours < 24) return hours === 1 ? 'il y a 1h' : `il y a ${hours}h`
  if (days === 1) return 'hier'
  if (days < 30) return `il y a ${days} jours`
  const months = Math.floor(days / 30)
  return months === 1 ? 'il y a 1 mois' : `il y a ${months} mois`
}

function TrackRow({ title, artistName, coverXl, listenedAt }: { title: string; artistName: string; coverXl: string; listenedAt: string }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
      <div className="relative w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
        <Image src={coverXl} alt={title} fill sizes="40px" className="object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <MarqueeText className={`${textStyles.body} font-medium text-text-primary`}>{title}</MarqueeText>
        <p className={`${textStyles.caption} text-text-secondary truncate`}>{artistName}</p>
      </div>
      <span className={`${textStyles.caption} text-text-disabled flex-shrink-0`}>{timeAgo(listenedAt)}</span>
    </div>
  )
}

function AlbumRow({ title, artistName, coverXl, lastListenedAt }: { title: string; artistName: string; coverXl: string; lastListenedAt: string }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
      <div className="relative w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
        <Image src={coverXl} alt={title} fill sizes="40px" className="object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <MarqueeText className={`${textStyles.body} font-medium text-text-primary`}>{title}</MarqueeText>
        <p className={`${textStyles.caption} text-text-secondary truncate`}>{artistName}</p>
      </div>
      <span className={`${textStyles.caption} text-text-disabled flex-shrink-0`}>{timeAgo(lastListenedAt)}</span>
    </div>
  )
}

export default function CollectionRecentActivitySection({
  recentTracks,
  recentAlbums,
  allTracks,
  allAlbums,
}: {
  recentTracks: RecentTrack[]
  recentAlbums: RecentAlbum[]
  allTracks: RecentTrack[]
  allAlbums: RecentAlbum[]
}) {
  const [mode, setMode] = useState<Mode>('tracks')
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  return (
    <>
      <section className="border border-bg-secondary rounded-lg p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className={`${textStyles.cardTitle} text-text-green`}>Activité récente</h2>
          <div className="flex items-center gap-0.5 bg-bg-tertiary rounded-full p-0.5">
            {(['tracks', 'albums'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  mode === m ? 'bg-bg-primary text-text-primary' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {m === 'tracks' ? 'Tracks' : 'Albums'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          {mode === 'tracks'
            ? recentTracks.map(t => (
                <TrackRow key={t.trackDeezerId} {...t} />
              ))
            : recentAlbums.map(a => (
                <AlbumRow key={a.albumDeezerId} {...a} />
              ))}
        </div>

        <button
          onClick={() => setIsPanelOpen(true)}
          className={`${textStyles.caption} text-text-primary hover:text-primary transition-colors flex items-center gap-1 self-start`}
        >
          Voir plus <ArrowRight size={12} />
        </button>
      </section>

      <Panel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)}>
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-border flex-shrink-0 pr-12">
            <h2 className={`${textStyles.sectionTitle} text-text-green`}>
              {mode === 'tracks' ? 'Tracks écoutés' : 'Albums écoutés'}
            </h2>
            <p className={`${textStyles.caption} text-text-secondary mt-1`}>
              {mode === 'tracks' ? allTracks.length : allAlbums.length} au total
            </p>
          </div>
          <div className="flex-1 overflow-y-auto px-5 pt-2">
            {mode === 'tracks'
              ? allTracks.map(t => <TrackRow key={t.trackDeezerId} {...t} />)
              : allAlbums.map(a => <AlbumRow key={a.albumDeezerId} {...a} />)}
          </div>
        </div>
      </Panel>
    </>
  )
}
