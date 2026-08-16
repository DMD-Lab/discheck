'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Image from 'next/image'
import { CheckCheck, Headphones, Star, Calendar, Share2 } from 'lucide-react'
import MarqueeText from '@/components/ui/marquee-text'
import type { DeezerAlbumResult, DeezerTrackResult } from '@/lib/deezer/types'
import TrackRow from '@/components/track/TrackRow'
import AlbumRatingModal from '@/components/ui/AlbumRatingModal'
import ShareModal from '@/components/album/ShareModal'
import DatePopover from '@/components/ui/date-popover'
import { textStyles } from '@/components/ui/text-styles'
import { RATING_COLORS } from '@/lib/rating-colors'

function formatDateBadge(isoStr: string): string {
  const d = new Date(isoStr)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}/${d.getFullYear()}`
}

function formatDateBadgeShort(isoStr: string): string {
  const d = new Date(isoStr)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}/${String(d.getFullYear()).slice(2)}`
}

interface AlbumDetailProps {
  album: DeezerAlbumResult
  artistName?: string
  listenedIds: Set<number>
  ratingMap: Map<number, number>
  albumRating?: number
  albumListenedAtUser?: string | null
  listenedDateMap: Map<number, { userDate: string | null; checkDate: string }>
  onToggleTrack: (trackId: number) => void
  onRateTrack: (trackId: number, rating: number) => void
  onRateAlbum: (rating: number) => void
  onRemoveTrackRating: (trackId: number) => void
  onRemoveAlbumRating: () => void
  onTracksLoaded: (albumId: number, trackIds: number[]) => void
  onCheckAll: (trackIds: number[]) => void
  onUncheckAll: (trackIds: number[]) => void
  onSetTrackDate: (trackId: number, date: string | null) => void
  onSetAlbumDate: (date: string | null) => void
  onSetSingleDate: (mainTrackId: number, date: string | null) => void
}

export default function AlbumDetail({ album, artistName, listenedIds, ratingMap, albumRating, albumListenedAtUser, listenedDateMap, onToggleTrack, onRateTrack, onRateAlbum, onRemoveTrackRating, onRemoveAlbumRating, onTracksLoaded, onCheckAll, onUncheckAll, onSetTrackDate, onSetAlbumDate, onSetSingleDate }: AlbumDetailProps) {
  const [tracks, setTracks] = useState<DeezerTrackResult[]>([])
  const [loadedAlbumId, setLoadedAlbumId] = useState<number | null>(null)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showAlbumDatePopover, setShowAlbumDatePopover] = useState(false)
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

  const releaseDate = (() => {
    if (album.release_date) {
      const [y, m, d] = album.release_date.split('-')
      return d && m && y ? `${d}/${m}/${y}` : album.release_date
    }
    return album.original_release_year?.toString() ?? '—'
  })()
  const listenedCount = tracks.filter(t => listenedIds.has(t.id)).length
  const allListened = tracks.length > 0 && listenedCount === tracks.length
  const singleMainTrack = album.record_type === 'single'
    ? (tracks.find(t => t.track_position === 1) ?? tracks[0])
    : undefined
  const singleTrackRating = singleMainTrack ? ratingMap.get(singleMainTrack.id) : undefined

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

  const ratedTracks = useMemo(() =>
    tracks
      .filter(t => listenedIds.has(t.id) && ratingMap.has(t.id))
      .sort((a, b) => a.track_position - b.track_position)
      .map(t => ({ position: t.track_position, title: t.title, rating: ratingMap.get(t.id)! })),
    [tracks, listenedIds, ratingMap]
  )

  // singles are rated on their main track, not the release itself
  const releaseRating = album.record_type === 'single'
    ? (singleMainTrack && listenedIds.has(singleMainTrack.id) ? singleTrackRating : undefined)
    : albumRating
  const canShare = album.record_type === 'single' ? !!releaseRating : allListened && !!albumRating

  const albumUserDate = useMemo(() => {
    if (!allListened) return null
    if (albumListenedAtUser) return albumListenedAtUser
    const dates = tracks
      .filter(t => listenedIds.has(t.id))
      .map(t => {
        const entry = listenedDateMap.get(t.id)
        return entry ? (entry.userDate ?? entry.checkDate) : null
      })
      .filter((d): d is string => !!d)
    return dates.length > 0 ? dates.sort().pop()! : null
  }, [albumListenedAtUser, allListened, tracks, listenedIds, listenedDateMap])

  // pour un single, la date affichée/pilotée par le widget est celle du track principal — pas un champ séparé
  const singleMainDateEntry = singleMainTrack ? listenedDateMap.get(singleMainTrack.id) : undefined
  const singleDate = useMemo(() => {
    if (!allListened) return null
    if (singleMainDateEntry?.userDate) return singleMainDateEntry.userDate
    const dates = tracks
      .filter(t => listenedIds.has(t.id))
      .map(t => {
        const entry = listenedDateMap.get(t.id)
        return entry ? (entry.userDate ?? entry.checkDate) : null
      })
      .filter((d): d is string => !!d)
    return dates.length > 0 ? dates.sort().pop()! : null
  }, [allListened, singleMainDateEntry, tracks, listenedIds, listenedDateMap])

  function handleRateInModal(rating: number) {
    if (album.record_type === 'single' && singleMainTrack) {
      if (!listenedIds.has(singleMainTrack.id)) onToggleTrack(singleMainTrack.id)
      onRateTrack(singleMainTrack.id, rating)
    } else {
      onRateAlbum(rating)
    }
    setShowRatingModal(false)
  }

  function handleRemoveInModal() {
    if (album.record_type === 'single' && singleMainTrack) {
      onRemoveTrackRating(singleMainTrack.id)
    } else {
      onRemoveAlbumRating()
    }
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
          {canShare && (
            <button
              onClick={() => setShowShareModal(true)}
              className="absolute top-[52px] right-4 z-20 w-7 h-7 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
            >
              <Share2 size={14} />
            </button>
          )}
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
            <p className={`${textStyles.caption} text-white/40 mt-0.5`}>Sortie le {releaseDate}</p>
          </div>
        </div>
      </div>

      {/* Stats area */}
      {loading && (
        <div className="px-4 py-3 border-b border-border flex-shrink-0">
          <div className={`grid ${album.record_type === 'single' ? 'grid-cols-3' : 'grid-cols-4'} gap-2`}>
            {Array.from({ length: album.record_type === 'single' ? 3 : 4 }).map((_, i) => (
              <div key={i} className="h-[68px] rounded-xl bg-bg-tertiary animate-pulse" />
            ))}
          </div>
        </div>
      )}
      {!loading && tracks.length > 0 && (
        <div className="px-4 py-3 border-b border-border flex-shrink-0 flex flex-col gap-2">

          {album.record_type === 'single' ? (

            /* 3 widgets pour les singles */
            <div className="grid grid-cols-3 gap-2">

              {/* Écouté */}
              <div
                className="flex flex-col items-center justify-center gap-1 max-sm:gap-0.5 rounded-xl border border-border bg-bg-secondary/50 px-2 py-3 max-sm:py-2 transition-colors"
                style={allListened ? { borderColor: 'var(--primary)' } : undefined}
              >
                <div className="flex items-center gap-1 max-sm:flex-col max-sm:gap-0.5">
                  <Headphones size={13} className={`max-sm:w-3 max-sm:h-3 ${listenedCount > 0 ? '' : 'text-text-disabled'}`} style={listenedCount > 0 ? { color: 'var(--primary)' } : undefined} />
                  <span className="text-xs text-text-secondary leading-none max-sm:text-center">Écouté</span>
                </div>
                <span className={`${textStyles.statSm} ${listenedCount > 0 ? 'text-text-primary' : 'text-text-disabled'}`}>
                  {listenedCount}/{tracks.length}
                </span>
              </div>

              {/* Note attribuée */}
              <button
                onClick={() => setShowRatingModal(true)}
                className={`flex flex-col items-center justify-center gap-1 max-sm:gap-0.5 rounded-xl border border-border bg-bg-secondary/50 px-2 py-3 max-sm:py-2 transition-colors w-full ${allListened ? 'hover:bg-bg-tertiary' : 'pointer-events-none'}`}
              >
                <div className="flex items-center gap-1 max-sm:flex-col max-sm:gap-0.5">
                  <Star size={13} className={`max-sm:w-3 max-sm:h-3 ${singleTrackRating ? '' : 'text-text-disabled'}`} style={singleTrackRating ? { color: RATING_COLORS[singleTrackRating], fill: RATING_COLORS[singleTrackRating] } : undefined} />
                  <span className="text-xs text-text-secondary leading-none max-sm:hidden">Note attribuée</span>
                  <span className="text-xs text-text-secondary leading-none hidden max-sm:block max-sm:text-center">Ma note</span>
                </div>
                <span className={`${textStyles.statSm} ${singleTrackRating ? 'text-text-primary' : 'text-text-disabled'}`}>
                  {singleTrackRating ? `${singleTrackRating},0` : '—'}
                </span>
              </button>

              {/* Date — widget cliquable, même logique que album/EP */}
              <div className="relative">
                <button
                  onClick={() => { if (allListened) setShowAlbumDatePopover(prev => !prev) }}
                  className={`flex flex-col items-center justify-center gap-1 max-sm:gap-0.5 rounded-xl border border-border bg-bg-secondary/50 px-2 py-3 max-sm:py-2 transition-colors w-full ${allListened ? 'hover:bg-bg-tertiary' : 'pointer-events-none'}`}
                >
                  <div className="flex items-center gap-1 max-sm:flex-col max-sm:gap-0.5">
                    <Calendar size={13} className={`max-sm:w-3 max-sm:h-3 ${singleDate ? 'text-text-green' : 'text-text-disabled'}`} />
                    <span className="text-xs text-text-secondary leading-none max-sm:hidden">Date d&apos;écoute</span>
                    <span className="text-xs text-text-secondary leading-none hidden max-sm:block max-sm:text-center">Écouté le</span>
                  </div>
                  <span className={`${textStyles.statSm} ${singleDate ? 'text-text-primary' : 'text-text-disabled'}`}>
                    {singleDate ? (
                      <>
                        <span className="max-sm:hidden">{formatDateBadge(singleDate)}</span>
                        <span className="hidden max-sm:block">{formatDateBadgeShort(singleDate)}</span>
                      </>
                    ) : '—'}
                  </span>
                </button>
                {showAlbumDatePopover && (
                  <DatePopover
                    currentDate={singleDate}
                    hasUserDate={!!singleMainDateEntry?.userDate}
                    releaseDate={album.release_date ? `${album.release_date}T00:00:00.000Z` : undefined}
                    onSetDate={date => { if (singleMainTrack) onSetSingleDate(singleMainTrack.id, date); setShowAlbumDatePopover(false) }}
                    onClose={() => setShowAlbumDatePopover(false)}
                  />
                )}
              </div>
            </div>

          ) : (

            /* 4 widgets pour albums et EPs */
            <div className="grid grid-cols-4 gap-2">

              {/* Écoutés X/X */}
              <div
                className="flex flex-col items-center justify-center gap-1 max-sm:gap-0.5 rounded-xl border border-border bg-bg-secondary/50 px-2 py-3 max-sm:py-2 transition-colors"
                style={allListened ? { borderColor: 'var(--primary)' } : undefined}
              >
                <div className="flex items-center gap-1 max-sm:flex-col max-sm:gap-0.5">
                  <Headphones size={13} className={`max-sm:w-3 max-sm:h-3 ${listenedCount > 0 ? '' : 'text-text-disabled'}`} style={listenedCount > 0 ? { color: 'var(--primary)' } : undefined} />
                  <span className="text-xs text-text-secondary leading-none max-sm:text-center">Écoutés</span>
                </div>
                <span className={`${textStyles.statSm} ${listenedCount > 0 ? 'text-text-primary' : 'text-text-disabled'}`}>{listenedCount}/{tracks.length}</span>
              </div>

              {/* Note moy. tracks */}
              <div className="flex flex-col items-center justify-center gap-1 max-sm:gap-0.5 rounded-xl border border-border bg-bg-secondary/50 px-2 py-3 max-sm:py-2">
                <div className="flex items-center gap-1 max-sm:flex-col max-sm:gap-0.5">
                  <Star size={13} className={`max-sm:w-3 max-sm:h-3 ${avgRating !== null ? '' : 'text-text-disabled'}`} style={avgRating !== null ? { color: RATING_COLORS[Math.floor(avgRating)], fill: RATING_COLORS[Math.floor(avgRating)] } : undefined} />
                  <span className="text-xs text-text-secondary leading-none max-sm:text-center">Note moy.</span>
                </div>
                <span className={`${textStyles.statSm} ${avgRating !== null ? 'text-text-primary' : 'text-text-disabled'}`}>
                  {avgRating !== null ? avgRating.toFixed(1).replace('.', ',') : '—'}
                </span>
              </div>

              {/* Note attribuée — clicable uniquement si tous les tracks sont cochés */}
              <button
                onClick={() => setShowRatingModal(true)}
                className={`flex flex-col items-center justify-center gap-1 max-sm:gap-0.5 rounded-xl border border-border bg-bg-secondary/50 px-2 py-3 max-sm:py-2 transition-colors w-full ${allListened ? 'hover:bg-bg-tertiary' : 'pointer-events-none'}`}
              >
                <div className="flex items-center gap-1 max-sm:flex-col max-sm:gap-0.5">
                  <Star size={13} className={`max-sm:w-3 max-sm:h-3 ${allListened && albumRating ? '' : 'text-text-disabled'}`} style={allListened && albumRating ? { color: RATING_COLORS[albumRating], fill: RATING_COLORS[albumRating] } : undefined} />
                  <span className="text-xs text-text-secondary leading-none max-sm:hidden">Note attribuée</span>
                  <span className="text-xs text-text-secondary leading-none hidden max-sm:block max-sm:text-center">Ma note</span>
                </div>
                <span className={`${textStyles.statSm} ${allListened && albumRating ? 'text-text-primary' : 'text-text-disabled'}`}>
                  {allListened && albumRating ? `${albumRating},0` : '—'}
                </span>
              </button>

              {/* Date — widget cliquable */}
              <div className="relative">
                <button
                  onClick={() => { if (allListened) setShowAlbumDatePopover(prev => !prev) }}
                  className={`flex flex-col items-center justify-center gap-1 max-sm:gap-0.5 rounded-xl border border-border bg-bg-secondary/50 px-2 py-3 max-sm:py-2 transition-colors w-full ${allListened ? 'hover:bg-bg-tertiary' : 'pointer-events-none'}`}
                >
                  <div className="flex items-center gap-1 max-sm:flex-col max-sm:gap-0.5">
                    <Calendar size={13} className={`max-sm:w-3 max-sm:h-3 ${albumUserDate ? 'text-text-green' : 'text-text-disabled'}`} />
                    <span className="text-xs text-text-secondary leading-none max-sm:hidden">Date d&apos;écoute</span>
                    <span className="text-xs text-text-secondary leading-none hidden max-sm:block max-sm:text-center">Écouté le</span>
                  </div>
                  <span className={`${textStyles.statSm} ${albumUserDate ? 'text-text-primary' : 'text-text-disabled'}`}>
                    {albumUserDate ? (
                      <>
                        <span className="max-sm:hidden">{formatDateBadge(albumUserDate)}</span>
                        <span className="hidden max-sm:block">{formatDateBadgeShort(albumUserDate)}</span>
                      </>
                    ) : '—'}
                  </span>
                </button>
                {showAlbumDatePopover && (
                  <DatePopover
                    currentDate={albumUserDate}
                    hasUserDate={!!albumListenedAtUser}
                    releaseDate={album.release_date ? `${album.release_date}T00:00:00.000Z` : undefined}
                    onSetDate={date => { onSetAlbumDate(date); setShowAlbumDatePopover(false) }}
                    onClose={() => setShowAlbumDatePopover(false)}
                  />
                )}
              </div>
            </div>

          )}

        </div>
      )}

      {/* Track list */}
      <div className="flex-1 overflow-y-auto py-2">
        {!loading && tracks.length > 1 && (
          <div className="flex items-center px-4 py-2.5">
            <button
              onClick={() => allListened
                ? onUncheckAll(tracks.map(t => t.id))
                : onCheckAll(tracks.map(t => t.id))
              }
              className="group flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-colors hover:border-primary"
              style={allListened
                ? { backgroundColor: 'var(--primary)', borderColor: 'var(--primary)' }
                : undefined
              }
            >
              {allListened
                ? <CheckCheck size={9} className="text-white" />
                : <CheckCheck size={9} className="opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all" />
              }
            </button>
          </div>
        )}
        {loading && (
          <div className="flex flex-col">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                <div className="w-5 h-5 rounded-full bg-bg-tertiary animate-pulse flex-shrink-0" />
                <div className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1 h-3.5 bg-bg-tertiary rounded animate-pulse" style={{ width: `${55 + (i * 13) % 30}%` }} />
                <div className="w-8 h-3 bg-bg-tertiary rounded animate-pulse flex-shrink-0" />
                <div className="w-10 h-5 rounded-full bg-bg-tertiary animate-pulse flex-shrink-0" />
              </div>
            ))}
          </div>
        )}
        {!loading && tracks.map(track => (
          <TrackRow
            key={track.id}
            position={track.track_position}
            title={track.title}
            duration={track.duration}
            trackId={track.id}
            hasPreview={!!track.preview}
            listened={listenedIds.has(track.id)}
            rating={listenedIds.has(track.id) ? ratingMap.get(track.id) : undefined}
            listenedAt={(() => { const e = listenedDateMap.get(track.id); return e ? (e.userDate ?? e.checkDate) : undefined })()}
            listenedAtUser={listenedIds.has(track.id) ? (listenedDateMap.get(track.id)?.userDate ?? null) : undefined}
            releaseDate={album.release_date ? `${album.release_date}T00:00:00.000Z` : undefined}
            onToggle={() => onToggleTrack(track.id)}
            onRate={(r) => onRateTrack(track.id, r)}
            onRemoveRating={() => onRemoveTrackRating(track.id)}
            onSetDate={(date) => onSetTrackDate(track.id, date)}
          />
        ))}
      </div>

      {showRatingModal && (
        <AlbumRatingModal
          currentRating={album.record_type === 'single' ? singleTrackRating : albumRating}
          onRate={handleRateInModal}
          onRemove={handleRemoveInModal}
          onSkip={() => setShowRatingModal(false)}
        />
      )}

      {showShareModal && canShare && (
        <ShareModal
          album={album}
          artistName={artistName}
          tracks={tracks}
          ratedTracks={ratedTracks}
          releaseRating={releaseRating}
          avgRating={avgRating}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </>
  )
}
