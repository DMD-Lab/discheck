'use client'

import { useRef, useState, useEffect, useLayoutEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Info } from 'lucide-react'
import gsap from 'gsap'
import AnimatedArrow from '@/components/ui/AnimatedArrow'
import Panel from '@/components/ui/panel'
import { textStyles } from '@/components/ui/text-styles'
import { prefersReducedMotion } from '@/lib/reduced-motion'
import { CONTENT_REVEAL_DELAY } from '@/lib/animation'
import type { PickerMode } from './RecapPicker'
import { ArtistPanelRow, ArtistRankItem, FEATURED_AVATAR_CLASS } from './RecapTopArtistsSection'

export type DiscoveredArtist = {
  artistDeezerId: number
  name: string
  pictureXl: string
  tracksListened: number
}

function InsightBadge({ children }: { children: React.ReactNode }) {
  return (
    <span data-item className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-text-green bg-text-green/10 text-text-green ${textStyles.caption} font-semibold`}>
      <Info size={14} className="flex-shrink-0" />
      {children}
    </span>
  )
}

export default function RecapDiscoveredArtistsSection({
  artists,
  mode,
  isDiscoveryCountRecord = false,
  maxDiscoveryTracksEver = 0,
  playToken = 0,
  resetToken = 0,
}: {
  artists: DiscoveredArtist[]
  mode: PickerMode
  isDiscoveryCountRecord?: boolean
  maxDiscoveryTracksEver?: number
  playToken?: number
  resetToken?: number
}) {
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useLayoutEffect(() => {
    if (prefersReducedMotion() || !containerRef.current) return
    const items = containerRef.current.querySelectorAll('[data-item], [data-row]')
    if (items.length > 0) gsap.set(items, { opacity: 0, scale: 0.7 })
    if (buttonRef.current) gsap.set(buttonRef.current, { opacity: 0, y: 12 })
  }, [resetToken])

  useEffect(() => {
    if (playToken === 0 || prefersReducedMotion() || !containerRef.current) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: CONTENT_REVEAL_DELAY })
      const items = containerRef.current!.querySelectorAll('[data-item], [data-row]')
      if (items.length > 0) {
        tl.fromTo(items, { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.7)', stagger: 0.08 })
      }
      if (buttonRef.current) tl.fromTo(buttonRef.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' })
    }, containerRef)

    return () => ctx.revert()
  }, [playToken])


  const sorted = [...artists].sort((a, b) => b.tracksListened - a.tracksListened)
  const [featured, ...rest] = sorted
  const shown = rest.slice(0, 4)
  const hasMoreAtBase = rest.length > 0
  const hasMoreAtMd = rest.length > 3
  const hasMoreAtLg = rest.length > 4
  const isBiggestDiscoveryEver = maxDiscoveryTracksEver > 0 && featured.tracksListened >= maxDiscoveryTracksEver

  return (
    <>
      <section ref={containerRef} className="w-full h-full flex flex-col items-center justify-center gap-6 md:gap-10 2xl:gap-10">
        <div data-item className="flex flex-col items-center gap-3">
          <div className={`relative ${FEATURED_AVATAR_CLASS} rounded-full overflow-hidden shadow-2xl flex-shrink-0`}>
            <Image src={featured.pictureXl} alt={featured.name} fill sizes="176px" className="object-cover" />
          </div>
          <div className="text-center">
            <Link href={`/artist/${featured.artistDeezerId}`} className="link-underline inline-block">
              <p className={`${textStyles.sectionTitle} text-text-primary`}>{featured.name}</p>
            </Link>
            <p className={`${textStyles.caption} text-text-secondary mt-0.5`}>
              {featured.tracksListened} titre{featured.tracksListened > 1 ? 's' : ''} écouté{featured.tracksListened > 1 ? 's' : ''}
            </p>
            {isBiggestDiscoveryEver && (
              <div className="mt-2">
                <InsightBadge>Ta plus grosse découverte de tous les temps</InsightBadge>
              </div>
            )}
          </div>
        </div>

        {(shown.length > 0 || isDiscoveryCountRecord) && (
          <div className="flex flex-col items-center gap-2">
            {shown.length > 0 && (
              <div className="flex flex-wrap justify-center gap-6 sm:gap-8 max-w-2xl">
                {shown.map((artist, i) => (
                  <div key={artist.artistDeezerId} className={i >= 3 ? 'hidden lg:block' : 'hidden md:block'}>
                    <ArtistRankItem artist={artist} size="md" />
                  </div>
                ))}
              </div>
            )}
            {isDiscoveryCountRecord && (
              <InsightBadge>Ton {mode === 'year' ? 'année' : 'mois'} avec le plus de découvertes</InsightBadge>
            )}
          </div>
        )}

        {hasMoreAtBase && (
          <button
            ref={buttonRef}
            onClick={() => setIsPanelOpen(true)}
            className={`${textStyles.caption} text-text-primary hover:text-primary transition-colors flex items-center gap-1 ${hasMoreAtMd ? '' : 'md:hidden'} ${hasMoreAtLg ? '' : 'lg:hidden'}`}
          >
            Voir plus
            <AnimatedArrow direction="right" size={12} />
          </button>
        )}
      </section>

      <Panel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)}>
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-border flex-shrink-0 pr-12">
            <h2 className={`${textStyles.sectionTitle} text-text-green`}>Nouveaux artistes</h2>
            <p className={`${textStyles.caption} text-text-secondary mt-1`}>
              {artists.length} artiste{artists.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {sorted.map((artist, i) => (
              <ArtistPanelRow key={artist.artistDeezerId} artist={artist} rank={i + 1} />
            ))}
          </div>
        </div>
      </Panel>
    </>
  )
}
