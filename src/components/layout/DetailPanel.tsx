'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { X, Check, CheckCheck, Music2, Headphones, Star } from 'lucide-react'
import type { DeezerAlbumResult, DeezerTrackResult } from '@/lib/deezer/types'
import TrackRow from '@/components/track/TrackRow'
import StatCard from '@/components/ui/StatCard'
import { textStyles } from '@/components/ui/text-styles'

interface DetailPanelProps {
  album: DeezerAlbumResult
  artistName?: string
  listenedIds: Set<number>
  ratingMap: Map<number, number>
  onToggleTrack: (trackId: number) => void
  onRateTrack: (trackId: number, rating: number) => void
  onTracksLoaded: (albumId: number, trackIds: number[]) => void
  onCheckAll: (trackIds: number[]) => void
  onUncheckAll: (trackIds: number[]) => void
  onClose: () => void
}

export default function DetailPanel({ album, artistName, listenedIds, ratingMap, onToggleTrack, onRateTrack, onTracksLoaded, onCheckAll, onUncheckAll, onClose }: DetailPanelProps) {
  const [tracks, setTracks] = useState<DeezerTrackResult[]>([])
  const [loadedAlbumId, setLoadedAlbumId] = useState<number | null>(null)
  const [visible, setVisible] = useState(false)
  const loading = loadedAlbumId !== album.id

  useEffect(() => {
    fetch(`/api/deezer/album/${album.id}/tracks`)
      .then(res => res.json())
      .then(data => {
        const loaded = data.data ?? []
        setTracks(loaded)
        setLoadedAlbumId(album.id)
        onTracksLoaded(album.id, loaded.map((t: DeezerTrackResult) => t.id))
      })
  }, [album.id, onTracksLoaded])

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [])

  function handleClose() {
    setVisible(false)
    setTimeout(onClose, 250)
  }

  const year = album.original_release_year ?? album.release_date?.slice(0, 4) ?? '—'
  const listenedCount = tracks.filter(t => listenedIds.has(t.id)).length
  const remaining = tracks.length - listenedCount
  const allListened = tracks.length > 0 && listenedCount === tracks.length

  const avgRating = useMemo(() => {
    if (tracks.length === 0) return null
    if (!tracks.every(t => listenedIds.has(t.id))) return null
    if (!tracks.every(t => ratingMap.has(t.id))) return null
    const sum = tracks.reduce((acc, t) => acc + (ratingMap.get(t.id) ?? 0), 0)
    return Math.round((sum / tracks.length) * 10) / 10
  }, [tracks, listenedIds, ratingMap])

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40"
        style={{
          backgroundColor: 'rgba(0,0,0,0.5)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.25s ease-in-out',
        }}
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        className="fixed top-0 right-0 h-screen w-full max-w-[600px] z-50 flex flex-col overflow-hidden bg-bg-secondary border-l border-border"
        style={{
          transform: visible ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.25s ease-in-out',
        }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 w-7 h-7 flex items-center justify-center rounded-full bg-bg-secondary border border-border text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
        >
          <X size={14} />
        </button>

        {/* Colored header with blurred cover */}
        <div className="relative flex-shrink-0 overflow-hidden">
          <Image
            src={album.cover_xl}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            className="object-cover"
            style={{ filter: 'blur(40px)', transform: 'scale(1.3)' }}
            aria-hidden
          />
          <div className="absolute inset-0 bg-black/50" />

          <div className="relative z-10 p-3 md:p-5 flex gap-3 md:gap-4">
            <Image
              src={album.cover_xl}
              alt={album.title}
              width={200}
              height={200}
              className="rounded-lg flex-shrink-0 object-cover shadow-xl w-24 h-24 md:w-[160px] md:h-[160px]"
              loading="eager"
            />
            <div className="flex flex-col justify-center min-w-0 pr-10 md:pr-0">
              <h2 className={`${textStyles.cardTitle} text-white truncate`}>{album.title}</h2>
              <span className={`${textStyles.caption} text-white/50 mt-1`}>
                {({ album: 'Album', single: 'Single', ep: 'EP', compilation: 'Compilation' } as Record<string, string>)[album.record_type] ?? album.record_type}
              </span>
              {artistName && (
                <p className={`${textStyles.body} text-white/70 mt-1 truncate`}>{artistName}</p>
              )}
              <p className={`${textStyles.caption} text-white/40 mt-0.5`}>{year}</p>
            </div>
          </div>
        </div>

        {/* 3 widgets + Tout cocher */}
        {!loading && tracks.length > 0 && (
          <div className="px-4 py-3 border-b border-border flex-shrink-0 flex flex-col gap-2">
            <div className="grid grid-cols-3 gap-2">
              <StatCard
                icon={<Music2 size={15} className="text-text-secondary" />}
                value={`${tracks.length}`}
                label="titres"
              />
              <StatCard
                icon={<Headphones size={15} style={{ color: 'var(--primary)' }} />}
                value={`${listenedCount}`}
                label="écoutés"
              />
              {!allListened ? (
                <StatCard
                  icon={<Music2 size={15} className="text-text-disabled" />}
                  value={`${remaining}`}
                  label="restants"
                />
              ) : avgRating !== null ? (
                <StatCard
                  icon={<Star size={15} style={{ color: 'var(--primary)' }} />}
                  value={avgRating % 1 === 0 ? avgRating.toFixed(0) : avgRating.toFixed(1)}
                  label="note moy."
                />
              ) : (
                <StatCard
                  icon={<Star size={15} className="text-text-disabled" />}
                  value="—"
                  label="note moy."
                  tooltip="Notez tous les titres pour obtenir une note"
                />
              )}
            </div>

          </div>
        )}

        {/* Track list */}
        <div className="flex-1 overflow-y-auto py-2">
          {!loading && tracks.length > 0 && (
            <button
              onClick={() => allListened
                ? onUncheckAll(tracks.map(t => t.id))
                : onCheckAll(tracks.map(t => t.id))
              }
              className="flex items-center gap-3 px-4 py-2.5 w-full hover:bg-bg-tertiary transition-colors group"
            >
              <span
                className="flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-colors"
                style={allListened
                  ? { backgroundColor: 'var(--primary)', borderColor: 'var(--primary)' }
                  : undefined
                }
              >
                {allListened
                  ? <Check size={10} strokeWidth={3} className="text-white" />
                  : <CheckCheck size={9} className="text-text-disabled group-hover:text-primary transition-colors" />
                }
              </span>
            </button>
          )}
          {loading && (
            <p className={`${textStyles.body} text-text-secondary px-5 py-4`}>Chargement...</p>
          )}
          {!loading && tracks.map(track => (
            <TrackRow
              key={track.id}
              position={track.track_position}
              title={track.title}
              duration={track.duration}
              listened={listenedIds.has(track.id)}
              rating={listenedIds.has(track.id) ? ratingMap.get(track.id) : undefined}
              onToggle={() => onToggleTrack(track.id)}
              onRate={(r) => onRateTrack(track.id, r)}
            />
          ))}
        </div>
      </div>
    </>
  )
}
