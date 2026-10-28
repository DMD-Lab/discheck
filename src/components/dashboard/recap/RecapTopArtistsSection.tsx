'use client'

import { useRef, useState, useEffect, useLayoutEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import gsap from 'gsap'
import AnimatedArrow from '@/components/ui/AnimatedArrow'
import MarqueeText from '@/components/ui/marquee-text'
import Panel from '@/components/ui/panel'
import { textStyles } from '@/components/ui/text-styles'
import { prefersReducedMotion } from '@/lib/reduced-motion'
import { CONTENT_REVEAL_DELAY } from '@/lib/animation'
import type { PickerMode } from './RecapPicker'
import { periodSuffix } from '@/lib/period-label'

export type RecapArtist = {
  artistDeezerId: number
  name: string
  pictureXl: string
  tracksListened: number
}

export function ArtistPanelRow({ artist, rank }: { artist: RecapArtist; rank: number }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3 border-b border-border last:border-0">
      <span className={`${textStyles.caption} text-text-disabled w-5 text-right flex-shrink-0`}>{rank}</span>
      <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
        <Image src={artist.pictureXl} alt={artist.name} fill sizes="40px" className="object-cover" />
      </div>
      <span className={`${textStyles.body} font-medium text-text-primary truncate flex-1 min-w-0`}>{artist.name}</span>
      <span className={`${textStyles.caption} text-text-secondary flex-shrink-0`}>
        {artist.tracksListened} titre{artist.tracksListened > 1 ? 's' : ''}
      </span>
    </div>
  )
}

const ARTIST_RANK_ITEM_SIZE = {
  sm: { outer: 'w-20', avatar: 'w-12 h-12', sizes: '48px' },
  md: { outer: 'w-24', avatar: 'w-16 h-16', sizes: '64px' },
} as const

export function ArtistRankItem({ artist, size = 'sm' }: { artist: RecapArtist; size?: keyof typeof ARTIST_RANK_ITEM_SIZE }) {
  const s = ARTIST_RANK_ITEM_SIZE[size]
  return (
    <div data-row className={`flex flex-col items-center gap-1 ${s.outer}`}>
      <div className={`relative ${s.avatar} rounded-full overflow-hidden shadow-md flex-shrink-0`}>
        <Image src={artist.pictureXl} alt={artist.name} fill sizes={s.sizes} className="object-cover" />
      </div>
      <div className="w-full text-center">
        <MarqueeText href={`/artist/${artist.artistDeezerId}`} className={`link-underline ${textStyles.caption} font-medium text-text-primary`}>
          {artist.name}
        </MarqueeText>
      </div>
      <span className={`${textStyles.caption} text-text-disabled`}>
        {artist.tracksListened} titre{artist.tracksListened > 1 ? 's' : ''}
      </span>
    </div>
  )
}

// non-monotonic by design
export const FEATURED_AVATAR_CLASS = 'w-28 h-28 sm:w-36 sm:h-36 md:w-28 md:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36 2xl:w-44 2xl:h-44'

const PODIUM_STYLE: Record<number, { circle: string; pedestal: string; medal: string }> = {
  1: { circle: FEATURED_AVATAR_CLASS, pedestal: 'h-28 sm:h-36 md:h-28 lg:h-32 xl:h-36 2xl:h-44', medal: 'bg-text-green text-white' },
  2: { circle: 'w-20 h-20 sm:w-24 sm:h-24 md:w-20 md:h-20 2xl:w-28 2xl:h-28', pedestal: 'h-20 sm:h-24 md:h-20 2xl:h-28', medal: 'bg-bg-tertiary text-text-primary' },
  3: { circle: 'w-20 h-20 sm:w-24 sm:h-24 md:w-20 md:h-20 2xl:w-28 2xl:h-28', pedestal: 'h-14 sm:h-16 md:h-14 2xl:h-20', medal: 'bg-bg-secondary text-text-primary' },
}

function PodiumColumn({
  artist,
  place,
  pedestalRef,
  revealRef,
}: {
  artist: RecapArtist
  place: number
  pedestalRef: React.RefObject<HTMLDivElement | null>
  revealRef: React.RefObject<HTMLDivElement | null>
}) {
  const style = PODIUM_STYLE[place]
  return (
    <div className="flex flex-col items-center gap-3 flex-1 min-w-0 max-w-[190px]">
      <div ref={revealRef} className="flex flex-col items-center gap-3 w-full min-w-0">
        <Link href={`/artist/${artist.artistDeezerId}`} className={`relative ${style.circle} rounded-full overflow-hidden shadow-lg flex-shrink-0`}>
          <Image src={artist.pictureXl} alt={artist.name} fill sizes="176px" className="object-cover" />
        </Link>
        <div className="text-center min-w-0 w-full">
          <MarqueeText href={`/artist/${artist.artistDeezerId}`} className={`link-underline ${textStyles.cardTitle} text-text-primary`}>
            {artist.name}
          </MarqueeText>
          <p className={`${textStyles.caption} text-text-secondary`}>
            {artist.tracksListened} titre{artist.tracksListened > 1 ? 's' : ''}
          </p>
        </div>
      </div>
      <div
        ref={pedestalRef}
        className={`w-full ${style.pedestal} rounded-t-lg ${style.medal} flex items-center justify-center flex-shrink-0 origin-bottom`}
      >
        <span className={`${textStyles.display} leading-none`}>{place}</span>
      </div>
    </div>
  )
}

export default function RecapTopArtistsSection({
  artists,
  mode,
  playToken = 0,
  resetToken = 0,
}: {
  artists: RecapArtist[]
  mode: PickerMode
  playToken?: number
  resetToken?: number
}) {
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const firstPedestalRef = useRef<HTMLDivElement>(null)
  const firstRevealRef = useRef<HTMLDivElement>(null)
  const secondPedestalRef = useRef<HTMLDivElement>(null)
  const secondRevealRef = useRef<HTMLDivElement>(null)
  const thirdPedestalRef = useRef<HTMLDivElement>(null)
  const thirdRevealRef = useRef<HTMLDivElement>(null)
  const extraListRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return
    const pedestals = [thirdPedestalRef.current, secondPedestalRef.current, firstPedestalRef.current].filter(Boolean)
    const reveals = [thirdRevealRef.current, secondRevealRef.current, firstRevealRef.current].filter(Boolean)
    if (pedestals.length > 0) gsap.set(pedestals, { scaleY: 0 })
    if (reveals.length > 0) gsap.set(reveals, { opacity: 0, scale: 0.7 })
    if (extraListRef.current) gsap.set(extraListRef.current, { opacity: 0, y: 12 })
    if (buttonRef.current) gsap.set(buttonRef.current, { opacity: 0, y: 12 })
  }, [resetToken])

  useEffect(() => {
    if (playToken === 0 || prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      const columns = [
        { pedestal: thirdPedestalRef.current, reveal: thirdRevealRef.current },
        { pedestal: secondPedestalRef.current, reveal: secondRevealRef.current },
        { pedestal: firstPedestalRef.current, reveal: firstRevealRef.current },
      ]

      const tl = gsap.timeline({ delay: CONTENT_REVEAL_DELAY })
      const columnStagger = 0.15
      columns.forEach(({ pedestal, reveal }, i) => {
        const pos = i * columnStagger
        if (pedestal) tl.fromTo(pedestal, { scaleY: 0 }, { scaleY: 1, duration: 0.35, ease: 'power2.out' }, pos)
        if (reveal) tl.fromTo(reveal, { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(1.7)' }, pos + 0.15)
      })
      if (extraListRef.current) {
        tl.fromTo(extraListRef.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' })
        const rows = extraListRef.current.querySelectorAll('[data-row]')
        if (rows.length > 0) {
          tl.fromTo(rows, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out', stagger: 0.04 }, '-=0.15')
        }
      }
      if (buttonRef.current) tl.fromTo(buttonRef.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' })
    }, containerRef)

    return () => ctx.revert()
  }, [playToken])

  const podium = artists.slice(0, 3)
  const others = artists.slice(3)
  const extra = others.slice(0, 7)
  const hasMoreBelowLg = others.length > 3
  const hasMoreBelowXl = others.length > 5
  const hasMoreFromXl = others.length > 7
  const second = podium[1]
  const first = podium[0]
  const third = podium[2]

  return (
    <>
      <section ref={containerRef} className="flex flex-col gap-8 items-center text-center">
        <div className="flex items-end justify-center gap-3 sm:gap-6 w-full max-w-2xl">
          {second && <PodiumColumn artist={second} place={2} pedestalRef={secondPedestalRef} revealRef={secondRevealRef} />}
          {first && <PodiumColumn artist={first} place={1} pedestalRef={firstPedestalRef} revealRef={firstRevealRef} />}
          {third && <PodiumColumn artist={third} place={3} pedestalRef={thirdPedestalRef} revealRef={thirdRevealRef} />}
        </div>

        {extra.length > 0 && (
          <div ref={extraListRef} className="w-full max-w-4xl flex flex-wrap justify-center gap-4 sm:gap-6">
            {extra.map((artist, i) => (
              <div key={artist.artistDeezerId} className={i >= 5 ? 'hidden xl:block' : i >= 3 ? 'hidden lg:block' : undefined}>
                <ArtistRankItem artist={artist} />
              </div>
            ))}
          </div>
        )}

        {hasMoreBelowLg && (
          <button
            ref={buttonRef}
            onClick={() => setIsPanelOpen(true)}
            className={`${textStyles.caption} text-text-primary hover:text-primary transition-colors flex items-center gap-1 ${hasMoreBelowXl ? '' : 'lg:hidden'} ${hasMoreFromXl ? '' : 'xl:hidden'}`}
          >
            Voir plus
            <AnimatedArrow direction="right" size={12} />
          </button>
        )}
      </section>

      <Panel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)}>
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-border flex-shrink-0 pr-12">
            <h2 className={`${textStyles.sectionTitle} text-text-green`}>Artistes {periodSuffix(mode)}</h2>
            <p className={`${textStyles.caption} text-text-secondary mt-1`}>
              {artists.length} artiste{artists.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {artists.map((artist, i) => (
              <ArtistPanelRow key={artist.artistDeezerId} artist={artist} rank={i + 1} />
            ))}
          </div>
        </div>
      </Panel>
    </>
  )
}
