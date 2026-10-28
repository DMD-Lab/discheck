'use client'

import { useRef, useState, useEffect, useLayoutEffect } from 'react'
import type { CSSProperties } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { Headphones, Disc3, Mic2, Timer } from 'lucide-react'
import { textStyles } from '@/components/ui/text-styles'
import { prefersReducedMotion } from '@/lib/reduced-motion'
import { CONTENT_REVEAL_DELAY } from '@/lib/animation'

export type RecapSummary = {
  tracksListened: number
  hoursListened: number
  artistsListened: number
  albumsListened: number
}

type BackgroundPosition = {
  topEdge: 'top' | 'bottom'
  topOffset: number
  leftEdge: 'left' | 'right'
  leftOffset: number
}

const BACKGROUND_SIZES: Array<{ sizeClass: string; rotation: number }> = [
  { sizeClass: 'w-32 h-32 sm:w-44 sm:h-44 md:w-36 md:h-36 xl:w-52 xl:h-52', rotation: -6 },
  { sizeClass: 'w-28 h-28 sm:w-40 sm:h-40 md:w-32 md:h-32 xl:w-48 xl:h-48', rotation: 5 },
  { sizeClass: 'w-36 h-36 sm:w-48 sm:h-48 md:w-40 md:h-40 xl:w-56 xl:h-56', rotation: 4 },
  { sizeClass: 'w-24 h-24 sm:w-36 sm:h-36 md:w-28 md:h-28 xl:w-44 xl:h-44', rotation: -4 },
  { sizeClass: 'w-28 h-28 sm:w-36 sm:h-36 md:w-28 md:h-28 xl:w-44 xl:h-44', rotation: -3 },
  { sizeClass: 'w-32 h-32 sm:w-40 sm:h-40 md:w-32 md:h-32 xl:w-48 xl:h-48', rotation: 3 },
]

// wide screens: 3x2
const BACKGROUND_POSITIONS: BackgroundPosition[] = [
  { topEdge: 'top', topOffset: 2, leftEdge: 'left', leftOffset: 14 },
  { topEdge: 'bottom', topOffset: 3, leftEdge: 'right', leftOffset: 14 },
  { topEdge: 'top', topOffset: 3, leftEdge: 'right', leftOffset: 3 },
  { topEdge: 'bottom', topOffset: 2, leftEdge: 'left', leftOffset: 2 },
  { topEdge: 'top', topOffset: 3, leftEdge: 'left', leftOffset: 46 },
  { topEdge: 'bottom', topOffset: 3, leftEdge: 'left', leftOffset: 28 },
]

// narrow: avoids middle gap
const BACKGROUND_POSITIONS_NARROW: BackgroundPosition[] = [
  { topEdge: 'top', topOffset: 1, leftEdge: 'left', leftOffset: 10 },
  { topEdge: 'top', topOffset: 1, leftEdge: 'right', leftOffset: 10 },
  { topEdge: 'top', topOffset: 46, leftEdge: 'left', leftOffset: 4 },
  { topEdge: 'top', topOffset: 46, leftEdge: 'right', leftOffset: 4 },
  { topEdge: 'bottom', topOffset: 1, leftEdge: 'left', leftOffset: 18 },
  { topEdge: 'bottom', topOffset: 1, leftEdge: 'right', leftOffset: 18 },
]

function formatHours(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function formatCount(n: number): string {
  return Math.round(n).toLocaleString('fr-FR')
}

export default function RecapSummarySection({
  summary,
  backgroundCovers = [],
  playToken = 0,
  resetToken = 0,
}: {
  summary: RecapSummary
  backgroundCovers?: string[]
  playToken?: number
  resetToken?: number
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const bgRefs = useRef<(HTMLDivElement | null)[]>([])
  const line1Ref = useRef<HTMLDivElement>(null)
  const line2Ref = useRef<HTMLDivElement>(null)
  const line3Ref = useRef<HTMLDivElement>(null)
  const line4Ref = useRef<HTMLDivElement>(null)
  const tracksRef = useRef<HTMLSpanElement>(null)
  const albumsRef = useRef<HTMLSpanElement>(null)
  const artistsRef = useRef<HTMLSpanElement>(null)
  const hoursRef = useRef<HTMLSpanElement>(null)
  const [isNarrow, setIsNarrow] = useState(false)

  useEffect(() => {
    function update() { setIsNarrow(window.innerWidth < 1024) }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return
    const items: Array<{ lineEl: HTMLDivElement | null; align: 'left' | 'right' }> = [
      { lineEl: line1Ref.current, align: 'left' },
      { lineEl: line2Ref.current, align: 'right' },
      { lineEl: line3Ref.current, align: 'left' },
      { lineEl: line4Ref.current, align: 'right' },
    ]
    items.forEach(({ lineEl, align }) => {
      if (lineEl) gsap.set(lineEl, { opacity: 0, x: align === 'left' ? -24 : 24 })
    })
    const bgEls = bgRefs.current.filter(Boolean)
    if (bgEls.length > 0) gsap.set(bgEls, { opacity: 0, scale: 0 })
  }, [resetToken])

  useEffect(() => {
    if (playToken === 0 || prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      const bgEls = bgRefs.current.filter(Boolean)
      if (bgEls.length > 0) {
        const shuffledBg = [...bgEls].sort(() => Math.random() - 0.5)
        gsap.fromTo(
          shuffledBg,
          { opacity: 0, scale: 0, y: 16 },
          { opacity: 0.1, scale: 1, y: 0, duration: 0.6, ease: 'back.out(1.7)', stagger: 0.15 },
        )
      }

      const items: Array<{
        lineEl: HTMLDivElement | null
        valueEl: HTMLSpanElement | null
        align: 'left' | 'right'
        value: number
        format: (n: number) => string
      }> = [
        { lineEl: line1Ref.current, valueEl: tracksRef.current, align: 'left', value: summary.tracksListened, format: formatCount },
        { lineEl: line2Ref.current, valueEl: albumsRef.current, align: 'right', value: summary.albumsListened, format: formatCount },
        { lineEl: line3Ref.current, valueEl: artistsRef.current, align: 'left', value: summary.artistsListened, format: formatCount },
        { lineEl: line4Ref.current, valueEl: hoursRef.current, align: 'right', value: summary.hoursListened, format: formatHours },
      ]

      items.forEach(({ lineEl, valueEl, align, value, format }, i) => {
        const delay = CONTENT_REVEAL_DELAY + i * 0.15
        if (lineEl) {
          gsap.fromTo(
            lineEl,
            { opacity: 0, x: align === 'left' ? -24 : 24 },
            { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out', delay },
          )
        }
        if (valueEl) {
          const counter = { n: 0 }
          gsap.to(counter, {
            n: value,
            duration: 0.9,
            ease: 'power1.out',
            delay,
            onUpdate: () => { valueEl.textContent = format(counter.n) },
          })
        }
      })
    }, containerRef)

    return () => ctx.revert()
  }, [playToken])

  const positions = isNarrow ? BACKGROUND_POSITIONS_NARROW : BACKGROUND_POSITIONS
  const backgroundImages = backgroundCovers.map((src, i) => ({ src, ...positions[i], ...BACKGROUND_SIZES[i] }))

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {backgroundImages.length > 0 && (
        <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          {backgroundImages.map((img, i) => (
            <div
              key={`${img.src}-${i}`}
              ref={el => { bgRefs.current[i] = el }}
              className={`absolute rounded-xl overflow-hidden opacity-10 ${img.sizeClass}`}
              style={{
                [img.topEdge]: `${img.topOffset}%`,
                [img.leftEdge]: `${img.leftOffset}%`,
                rotate: `${img.rotation}deg`,
              } as CSSProperties}
            >
              <Image src={img.src} alt="" fill sizes="240px" className="object-cover" />
            </div>
          ))}
        </div>
      )}
      <div className="w-full h-full flex flex-col items-center justify-center gap-[clamp(0.5rem,5vh,2.5rem)] max-w-2xl mx-auto px-4">
        <div ref={line1Ref} className="flex flex-col items-start gap-1 self-start">
          <span className={`${textStyles.overline} text-text-secondary`}>Titres écoutés</span>
          <div className="flex items-center gap-[clamp(0.5rem,2vh,1rem)]">
            <Headphones className="w-[clamp(1rem,4vh,2rem)] h-[clamp(1rem,4vh,2rem)] sm:w-[clamp(1.5rem,6vh,3.5rem)] sm:h-[clamp(1.5rem,6vh,3.5rem)] text-text-green flex-shrink-0" />
            <span ref={tracksRef} className="text-[clamp(1.5rem,6vh,3rem)] sm:text-[clamp(2rem,9vh,6rem)] font-bold text-white tabular-nums leading-none whitespace-nowrap">0</span>
          </div>
        </div>
        <div ref={line2Ref} className="flex flex-col items-end gap-1 self-end">
          <span className={`${textStyles.overline} text-text-secondary`}>Albums et EP écoutés</span>
          <div className="flex flex-row-reverse items-center gap-[clamp(0.5rem,2vh,1rem)]">
            <Disc3 className="w-[clamp(0.875rem,3vh,1.5rem)] h-[clamp(0.875rem,3vh,1.5rem)] sm:w-[clamp(1.25rem,4.5vh,2.5rem)] sm:h-[clamp(1.25rem,4.5vh,2.5rem)] text-text-green flex-shrink-0" />
            <span ref={albumsRef} className="text-[clamp(1.25rem,4.5vh,2.5rem)] sm:text-[clamp(1.75rem,7vh,3.75rem)] font-bold text-white tabular-nums leading-none whitespace-nowrap">0</span>
          </div>
        </div>
        <div ref={line3Ref} className="flex flex-col items-start gap-1 self-start">
          <span className={`${textStyles.overline} text-text-secondary`}>Artistes écoutés</span>
          <div className="flex items-center gap-[clamp(0.5rem,2vh,1rem)]">
            <Mic2 className="w-[clamp(0.875rem,3vh,1.5rem)] h-[clamp(0.875rem,3vh,1.5rem)] sm:w-[clamp(1.25rem,4.5vh,2.5rem)] sm:h-[clamp(1.25rem,4.5vh,2.5rem)] text-text-green flex-shrink-0" />
            <span ref={artistsRef} className="text-[clamp(1.25rem,4.5vh,2.5rem)] sm:text-[clamp(1.75rem,7vh,3.75rem)] font-bold text-white tabular-nums leading-none whitespace-nowrap">0</span>
          </div>
        </div>
        <div ref={line4Ref} className="flex flex-col items-end gap-1 self-end">
          <span className={`${textStyles.overline} text-text-secondary`}>Temps d&apos;écoute</span>
          <div className="flex flex-row-reverse items-center gap-[clamp(0.5rem,2vh,1rem)]">
            <Timer className="w-[clamp(1rem,4vh,2rem)] h-[clamp(1rem,4vh,2rem)] sm:w-[clamp(1.5rem,6vh,3.5rem)] sm:h-[clamp(1.5rem,6vh,3.5rem)] text-text-green flex-shrink-0" />
            <span ref={hoursRef} className="text-[clamp(1.5rem,6vh,3rem)] sm:text-[clamp(2rem,9vh,6rem)] font-bold text-white tabular-nums leading-none whitespace-nowrap">0</span>
          </div>
        </div>
      </div>
    </div>
  )
}
