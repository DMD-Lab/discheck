'use client'

import { useRef, useState, useEffect, useLayoutEffect } from 'react'
import { Star, Music2, Disc3 } from 'lucide-react'
import gsap from 'gsap'
import { textStyles } from '@/components/ui/text-styles'
import AnimatedArrow from '@/components/ui/AnimatedArrow'
import Panel from '@/components/ui/panel'
import RecapRow, { RecapRowSlot } from './recap-row'
import RecapTracksListenedRanking from './recap-tracks-listened-ranking'
import RecapAlbumsListenedRanking from './recap-albums-listened-ranking'
import { prefersReducedMotion } from '@/lib/reduced-motion'
import { CONTENT_REVEAL_DELAY } from '@/lib/animation'
import { DIAGONAL_GRID_CLASS, DIAGONAL_OFFSET_CLASS, DIAGONAL_OFFSET_CLASS_LIGHT } from './diagonal-layout'
import type { PickerMode } from './RecapPicker'
import { periodThis } from '@/lib/period-label'

export type ListenedTrack = {
  trackDeezerId: number
  title: string
  artistName: string
  artistDeezerId: number
  coverXl: string
  rating: number | null
  listenedAt: string
}

export type ListenedAlbum = {
  albumDeezerId: number
  title: string
  artistName: string
  artistDeezerId: number
  coverXl: string
  recordType: string
  albumRating: number | null
  trackAvg: number | null
  lastListenedAt: string
}

export function formatListenedDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function TrackCard({ track }: { track: ListenedTrack }) {
  return (
    <RecapRow coverXl={track.coverXl} title={track.title} artistName={track.artistName} artistDeezerId={track.artistDeezerId}>
      <div className="flex flex-col items-end gap-0.5">
        {track.rating !== null ? (
          <div className="flex items-center gap-1">
            <Star size={11} className="text-text-green fill-text-green" />
            <span className={`${textStyles.caption} font-semibold text-text-primary`}>{track.rating.toFixed(1).replace('.', ',')}</span>
          </div>
        ) : (
          <span className={`${textStyles.caption} text-text-disabled`}>Non noté</span>
        )}
        <span className="text-[10px] text-text-disabled">{formatListenedDate(track.listenedAt)}</span>
      </div>
    </RecapRow>
  )
}

function AlbumCard({ album }: { album: ListenedAlbum }) {
  return (
    <RecapRow coverXl={album.coverXl} title={album.title} artistName={album.artistName} artistDeezerId={album.artistDeezerId} mirror>
      <div className="flex flex-col items-end lg:items-start gap-0.5">
        <div className="flex items-center gap-1 lg:flex-row-reverse">
          <Star size={11} className="text-text-green fill-text-green" />
          <span className={`${textStyles.caption} font-semibold text-text-primary`}>
            {album.albumRating !== null ? album.albumRating.toFixed(1).replace('.', ',') : '—'}
          </span>
          <div className="w-px h-3 bg-border flex-shrink-0" />
          <Star size={11} className="text-text-secondary fill-text-secondary" />
          <span className={`${textStyles.caption} text-text-secondary`}>
            {album.trackAvg !== null ? album.trackAvg.toFixed(1).replace('.', ',') : '—'}
          </span>
        </div>
        <span className="text-[10px] text-text-disabled">{formatListenedDate(album.lastListenedAt)}</span>
      </div>
    </RecapRow>
  )
}

export default function RecapListenedSection({
  tracks,
  albums,
  start,
  end,
  mode,
  playToken = 0,
  resetToken = 0,
  reduceOffset = false,
}: {
  tracks: ListenedTrack[]
  albums: ListenedAlbum[]
  start: string
  end: string
  mode: PickerMode
  playToken?: number
  resetToken?: number
  reduceOffset?: boolean
}) {
  const [isTracksPanelOpen, setIsTracksPanelOpen] = useState(false)
  const [isAlbumsPanelOpen, setIsAlbumsPanelOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const tracksTitleRef = useRef<HTMLHeadingElement>(null)
  const tracksButtonRef = useRef<HTMLButtonElement>(null)
  const tracksBodyRef = useRef<HTMLDivElement>(null)
  const albumsTitleRef = useRef<HTMLHeadingElement>(null)
  const albumsButtonRef = useRef<HTMLButtonElement>(null)
  const albumsBodyRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return
    gsap.set([tracksTitleRef.current, albumsTitleRef.current].filter(Boolean), { opacity: 0, y: -8 })
    gsap.set([tracksBodyRef.current, albumsBodyRef.current].filter(Boolean), { opacity: 0, y: 12 })
    gsap.set([tracksButtonRef.current, albumsButtonRef.current].filter(Boolean), { opacity: 0 })
  }, [resetToken])

  useEffect(() => {
    if (playToken === 0 || prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: CONTENT_REVEAL_DELAY })

      const tracks = { title: tracksTitleRef.current, body: tracksBodyRef.current, button: tracksButtonRef.current }
      const albums = { title: albumsTitleRef.current, body: albumsBodyRef.current, button: albumsButtonRef.current }
      // order flips by layout
      const isStacked = window.innerWidth < 1024
      const sections = isStacked ? [tracks, albums] : [albums, tracks]

      sections.forEach(({ title, body, button }) => {
        if (title) tl.fromTo(title, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' })
        if (body) {
          tl.fromTo(body, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }, '+=0.05')
          const rows = body.querySelectorAll('[data-row]')
          if (rows.length > 0) {
            tl.fromTo(rows, { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out', stagger: 0.05 }, '-=0.15')
          }
        }
        if (button) tl.fromTo(button, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power2.out' })
      })
    }, containerRef)

    return () => ctx.revert()
  }, [playToken])

  return (
    <>
      <div ref={containerRef} className={DIAGONAL_GRID_CLASS}>
        <section className={`flex flex-col gap-2 items-start min-w-0 ${reduceOffset ? DIAGONAL_OFFSET_CLASS_LIGHT : DIAGONAL_OFFSET_CLASS}`}>
          <div className="flex items-center gap-3">
            <h3 ref={tracksTitleRef} className={`${textStyles.sectionTitle} text-text-green`}>Titres écoutés</h3>
            {tracks.length > 0 && (
              <button
                ref={tracksButtonRef}
                onClick={() => setIsTracksPanelOpen(true)}
                className={`${textStyles.caption} text-text-primary hover:text-primary transition-colors flex items-center gap-1`}
              >
                Voir plus
                <AnimatedArrow direction="right" size={12} />
              </button>
            )}
          </div>
          <div ref={tracksBodyRef} className="w-full">
            {tracks.length === 0 ? (
              <div className="min-h-[120px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-center">
                  <Music2 size={40} className="text-text-disabled" />
                  <p className={`${textStyles.caption} text-text-secondary`}>Aucun titre écouté {periodThis(mode)}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-start gap-1 min-w-0">
                {tracks.map((track, i) => (
                  <RecapRowSlot key={track.trackDeezerId} index={i}>
                    <TrackCard track={track} />
                  </RecapRowSlot>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-2 items-start lg:items-end min-w-0">
          <div className="flex items-center gap-3">
            <h3 ref={albumsTitleRef} className={`${textStyles.sectionTitle} text-text-green`}>
              <span className="xl:hidden">Albums &amp; EP</span>
              <span className="hidden xl:inline">Albums &amp; EP écoutés</span>
            </h3>
            {albums.length > 0 && (
              <button
                ref={albumsButtonRef}
                onClick={() => setIsAlbumsPanelOpen(true)}
                className={`${textStyles.caption} text-text-primary hover:text-primary transition-colors flex items-center gap-1`}
              >
                Voir plus
                <AnimatedArrow direction="right" size={12} />
              </button>
            )}
          </div>
          <div ref={albumsBodyRef} className="w-full">
            {albums.length === 0 ? (
              <div className="min-h-[120px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-center">
                  <Disc3 size={40} className="text-text-disabled" />
                  <p className={`${textStyles.caption} text-text-secondary`}>Aucun album/EP écouté {periodThis(mode)}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-start lg:items-end gap-1 min-w-0">
                {albums.map((album, i) => (
                  <RecapRowSlot key={album.albumDeezerId} index={i}>
                    <AlbumCard album={album} />
                  </RecapRowSlot>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <Panel isOpen={isTracksPanelOpen} onClose={() => setIsTracksPanelOpen(false)}>
        <RecapTracksListenedRanking start={start} end={end} />
      </Panel>
      <Panel isOpen={isAlbumsPanelOpen} onClose={() => setIsAlbumsPanelOpen(false)}>
        <RecapAlbumsListenedRanking start={start} end={end} />
      </Panel>
    </>
  )
}
