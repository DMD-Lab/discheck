'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Image from 'next/image'
import { Check, CheckCheck, Music2, Headphones, Star } from 'lucide-react'
import MarqueeText from '@/components/ui/marquee-text'
import type { DeezerAlbumResult, DeezerTrackResult } from '@/lib/deezer/types'
import TrackRow from '@/components/track/TrackRow'
import StatCard from '@/components/ui/StatCard'
import AlbumRatingModal from '@/components/ui/AlbumRatingModal'
import { textStyles } from '@/components/ui/text-styles'

const RATING_COLORS: Record<number, string> = {
  1: '#ef4444',
  2: '#f97316',
  3: '#eab308',
  4: '#84cc16',
  5: '#22c55e',
}

interface AlbumDetailProps {
  album: DeezerAlbumResult
  artistName?: string
  listenedIds: Set<number>
  ratingMap: Map<number, number>
  albumRating?: number
  onToggleTrack: (trackId: number) => void
  onRateTrack: (trackId: number, rating: number) => void
  onRateAlbum: (rating: number) => void
  onTracksLoaded: (albumId: number, trackIds: number[]) => void
  onCheckAll: (trackIds: number[]) => void
  onUncheckAll: (trackIds: number[]) => void
}

export default function AlbumDetail({ album, artistName, listenedIds, ratingMap, albumRating, onToggleTrack, onRateTrack, onRateAlbum, onTracksLoaded, onCheckAll, onUncheckAll }: AlbumDetailProps) {
  const [tracks, setTracks] = useState<DeezerTrackResult[]>([])
  const [loadedAlbumId, setLoadedAlbumId] = useState<number | null>(null)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const wasAllListened = useRef<boolean | null>(null)
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

  const year = album.original_release_year ?? album.release_date?.slice(0, 4) ?? '—'
  const listenedCount = tracks.filter(t => listenedIds.has(t.id)).length
  const remaining = tracks.length - listenedCount
  const allListened = tracks.length > 0 && listenedCount === tracks.length

  useEffect(() => {
    if (loading) return
    const prev = wasAllListened.current
    wasAllListened.current = allListened
    if (prev === false && allListened) {
      const type = album.record_type
      if ((type === 'album' || type === 'ep') && !albumRating) {
        setTimeout(() => setShowRatingModal(true), 0)
      }
    }
  }, [allListened, loading, album.record_type, albumRating])

  const avgRating = useMemo(() => {
    if (tracks.length === 0) return null
    if (!tracks.every(t => listenedIds.has(t.id))) return null
    if (!tracks.every(t => ratingMap.has(t.id))) return null
    const sum = tracks.reduce((acc, t) => acc + (ratingMap.get(t.id) ?? 0), 0)
    return Math.round((sum / tracks.length) * 10) / 10
  }, [tracks, listenedIds, ratingMap])

  function handleRateInModal(rating: number) {
    onRateAlbum(rating)
    setShowRatingModal(false)
  }

  return (
    <>
      {/* Header with blurred cover */}
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
            <MarqueeText className={`${textStyles.cardTitle} text-white`} fromColor="from-transparent">{album.title}</MarqueeText>
            <span className={`${textStyles.caption} text-white/50 mt-1`}>
              {({ album: 'Album', single: 'Single', ep: 'EP', compilation: 'Compilation' } as Record<string, string>)[album.record_type] ?? album.record_type}
            </span>
            {artistName && (
              <p className={`${textStyles.body} text-white/70 mt-1 truncate`}>{artistName}</p>
            )}
            <p className={`${textStyles.caption} text-white/40 mt-0.5`}>{year}</p>
            {albumRating && (
              <button
                onClick={() => setShowRatingModal(true)}
                className={`${textStyles.caption} font-bold mt-2 w-fit px-2 py-0.5 rounded transition-opacity hover:opacity-80`}
                style={{
                  color: RATING_COLORS[albumRating],
                  backgroundColor: `${RATING_COLORS[albumRating]}33`,
                }}
              >
                Note album : {albumRating}/5
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3 widgets */}
      {!loading && tracks.length > 0 && (
        <div className="px-4 py-3 border-b border-border flex-shrink-0">
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

      {showRatingModal && (
        <AlbumRatingModal
          currentRating={albumRating}
          onRate={handleRateInModal}
          onSkip={() => setShowRatingModal(false)}
        />
      )}
    </>
  )
}
