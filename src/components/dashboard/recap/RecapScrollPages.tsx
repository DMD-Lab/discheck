'use client'

import { useRef, useState, useEffect, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { textStyles } from '@/components/ui/text-styles'
import { prefersReducedMotion } from '@/lib/reduced-motion'
import RecapSummarySection from './RecapSummarySection'
import type { RecapSummary } from './RecapSummarySection'
import RecapTopArtistsSection from './RecapTopArtistsSection'
import type { RecapArtist } from './RecapTopArtistsSection'
import RecapFavoritesSection from './RecapFavoritesSection'
import type { FavoriteTrack, FavoriteAlbum } from './RecapFavoritesSection'
import RecapListenedSection from './RecapListenedSection'
import type { ListenedTrack, ListenedAlbum } from './RecapListenedSection'
import RecapDiscoveredArtistsSection from './RecapDiscoveredArtistsSection'
import type { DiscoveredArtist } from './RecapDiscoveredArtistsSection'
import type { PickerMode } from './RecapPicker'
import { periodThis, periodSuffix } from '@/lib/period-label'
import { DIAGONAL_OFFSET_REDUCE_HEIGHT } from './diagonal-layout'

const STORY_MIN_HEIGHT = 800

export default function RecapScrollPages({
  mode,
  introTitle,
  summary,
  backgroundCovers,
  topArtists,
  artistTitle,
  favoriteTracks,
  favoriteAlbums,
  favoritesTitle,
  listenedTracks,
  listenedAlbums,
  listenedTitle,
  discoveredArtists,
  discoveredTitle,
  isDiscoveryCountRecord,
  maxDiscoveryTracksEver,
  start,
  end,
}: {
  mode: PickerMode
  introTitle: string
  summary: RecapSummary
  backgroundCovers: string[]
  topArtists: RecapArtist[]
  artistTitle: string
  favoriteTracks: FavoriteTrack[]
  favoriteAlbums: FavoriteAlbum[]
  favoritesTitle: string
  listenedTracks: ListenedTrack[]
  listenedAlbums: ListenedAlbum[]
  listenedTitle: string
  discoveredArtists: DiscoveredArtist[]
  discoveredTitle: string
  isDiscoveryCountRecord: boolean
  maxDiscoveryTracksEver: number
  start: string
  end: string
}) {
  const pages: Array<{ id: string; title: string; subtitle?: React.ReactNode }> = [
    { id: 'summary', title: introTitle },
    ...(topArtists.length > 0 ? [{ id: 'artist', title: artistTitle }] : []),
    ...(favoriteTracks.length > 0 || favoriteAlbums.length > 0 ? [{ id: 'favorites', title: favoritesTitle }] : []),
    ...(listenedTracks.length > 0 || listenedAlbums.length > 0 ? [{ id: 'listened', title: listenedTitle }] : []),
    ...(discoveredArtists.length > 0 ? [{
      id: 'discovered',
      title: discoveredTitle,
      subtitle: (
        <>
          <span className="text-2xl sm:text-3xl text-text-green font-bold">{discoveredArtists.length}</span> artiste{discoveredArtists.length > 1 ? 's' : ''} découvert{discoveredArtists.length > 1 ? 's' : ''} {periodThis(mode)}
        </>
      ),
    }] : []),
  ]

  const containerRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<(HTMLElement | null)[]>([])
  const titleRefs = useRef<(HTMLHeadingElement | null)[]>([])
  const subtitleRefs = useRef<(HTMLParagraphElement | null)[]>([])
  const activeIndexRef = useRef(0)
  const playedForDatasetRef = useRef<Set<number>>(new Set())
  const prevPlayTokensRef = useRef<number[]>(pages.map(() => 0))
  const [activeIndex, setActiveIndex] = useState(0)
  const [playTokens, setPlayTokens] = useState<number[]>(() => pages.map(() => 0))
  const [resetTokens, setResetTokens] = useState<number[]>(() => pages.map(() => 0))
  const [height, setHeight] = useState<number | null>(null)
  const [isCompact, setIsCompact] = useState(false)
  const [reduceOffset, setReduceOffset] = useState(false)

  const datasetKey = `${start}|${end}`
  const [prevDatasetKey, setPrevDatasetKey] = useState(datasetKey)
  const isFirstResetRef = useRef(true)

  // avoids render flash
  if (datasetKey !== prevDatasetKey) {
    setPrevDatasetKey(datasetKey)
    const gen = Math.max(0, ...resetTokens, ...playTokens) + 1
    setResetTokens(pages.map(() => gen))
    setPlayTokens(pages.map((_, i) => (i === 0 ? gen : 0)))
    setActiveIndex(0)
  }

  // must run first
  useLayoutEffect(() => {
    activeIndexRef.current = 0
  }, [datasetKey])

  useLayoutEffect(() => {
    if (isFirstResetRef.current) {
      isFirstResetRef.current = false
    } else {
      playedForDatasetRef.current = new Set([activeIndexRef.current])
    }
    if (prefersReducedMotion()) return
    titleRefs.current.forEach(el => { if (el) gsap.set(el, { opacity: 0, y: -12 }) })
    subtitleRefs.current.forEach(el => { if (el) gsap.set(el, { opacity: 0, y: -12 }) })
  }, [resetTokens])

  useEffect(() => {
    if (prefersReducedMotion()) return
    playTokens.forEach((token, i) => {
      if (token <= prevPlayTokensRef.current[i]) return
      const titleEl = titleRefs.current[i]
      if (titleEl) {
        gsap.fromTo(titleEl, { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out', overwrite: true })
      }
      const subtitleEl = subtitleRefs.current[i]
      if (subtitleEl) {
        gsap.fromTo(subtitleEl, { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out', overwrite: true, delay: 0.05 })
      }
    })
    prevPlayTokensRef.current = playTokens
  }, [playTokens])

  useEffect(() => {
    function updateHeight() {
      const compact = window.innerHeight < STORY_MIN_HEIGHT
      setIsCompact(compact)
      setReduceOffset(window.innerHeight < DIAGONAL_OFFSET_REDUCE_HEIGHT)
      if (compact || !containerRef.current) return
      const currentHeight = containerRef.current.getBoundingClientRect().height
      const overflow = document.documentElement.scrollHeight - window.innerHeight
      setHeight(Math.max(currentHeight - overflow, 320))
    }
    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [])

  function bumpPlay(idx: number) {
    if (playedForDatasetRef.current.has(idx)) return
    playedForDatasetRef.current.add(idx)
    setPlayTokens(prev => prev.map((t, i) => (i === idx ? t + 1 : t)))
  }

  const pageIdsKey = pages.map(p => p.id).join(',')

  // resets scroll position
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' })
  }, [datasetKey])

  useEffect(() => {
    const scrollEl = scrollRef.current
    if (!scrollEl) return

    const activeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return
        const idx = sectionRefs.current.findIndex(el => el === entry.target)
        if (idx === -1) return
        activeIndexRef.current = idx
        setActiveIndex(idx)
      })
    }, { root: scrollEl, rootMargin: '-45% 0px -45% 0px', threshold: 0 })

    sectionRefs.current.forEach(el => el && activeObserver.observe(el))

    function handleScrollEnd() {
      bumpPlay(activeIndexRef.current)
    }

    scrollEl.addEventListener('scrollend', handleScrollEnd)
    bumpPlay(0)

    return () => {
      activeObserver.disconnect()
      scrollEl.removeEventListener('scrollend', handleScrollEnd)
    }
  }, [isCompact, pageIdsKey])

  const shortTitles: Record<string, string> = {
    favorites: `Favori ${periodSuffix(mode)}`,
    listened: `Écoutes ${periodSuffix(mode)}`,
    discovered: `Découvertes ${periodSuffix(mode)}`,
  }

  function renderTitle(page: { id: string; title: string }) {
    const short = shortTitles[page.id]
    if (!short) return page.title
    return (
      <>
        <span className="xl:hidden">{short}</span>
        <span className="hidden xl:inline">{page.title}</span>
      </>
    )
  }

  function goToPage(index: number) {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    sectionRefs.current[index]?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
  }

  function renderPageContent(id: string, playToken: number, resetToken: number) {
    switch (id) {
      case 'summary':
        return <RecapSummarySection summary={summary} backgroundCovers={backgroundCovers} playToken={playToken} resetToken={resetToken} />
      case 'artist':
        return <RecapTopArtistsSection artists={topArtists} mode={mode} playToken={playToken} resetToken={resetToken} />
      case 'favorites':
        return (
          <RecapFavoritesSection
            tracks={favoriteTracks}
            albums={favoriteAlbums}
            start={start}
            end={end}
            mode={mode}
            playToken={playToken}
            resetToken={resetToken}
            reduceOffset={reduceOffset}
          />
        )
      case 'listened':
        return (
          <RecapListenedSection
            tracks={listenedTracks}
            albums={listenedAlbums}
            start={start}
            end={end}
            mode={mode}
            playToken={playToken}
            resetToken={resetToken}
            reduceOffset={reduceOffset}
          />
        )
      case 'discovered':
        return (
          <RecapDiscoveredArtistsSection
            artists={discoveredArtists}
            mode={mode}
            isDiscoveryCountRecord={isDiscoveryCountRecord}
            maxDiscoveryTracksEver={maxDiscoveryTracksEver}
            playToken={playToken}
            resetToken={resetToken}
          />
        )
      default:
        return null
    }
  }

  if (isCompact) {
    return (
      <div className="flex flex-col gap-16 py-8">
        {pages.map(page => (
          <section key={page.id} className="flex flex-col items-center px-4">
            <h2 className="text-3xl font-bold leading-tight md:text-4xl xl:text-5xl text-text-green text-center">{renderTitle(page)}</h2>
            {page.subtitle && (
              <p className="text-xl sm:text-2xl font-semibold text-text-primary text-center mt-2">
                {page.subtitle}
              </p>
            )}
            <div className="w-full flex flex-col gap-8 mt-8">
              {renderPageContent(page.id, 1, 0)}
            </div>
          </section>
        ))}
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative min-h-[70vh]" style={height !== null ? { height } : undefined}>
      <div
        ref={scrollRef}
        className="h-full overflow-y-auto snap-y snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {pages.map((page, i) => (
          <section
            key={page.id}
            ref={el => { sectionRefs.current[i] = el }}
            className="h-full snap-start flex flex-col items-center"
          >
            <div className="w-full h-full flex flex-col items-center px-4">
              <h2
                ref={el => { titleRefs.current[i] = el }}
                className="text-3xl font-bold leading-tight md:text-4xl xl:text-5xl text-text-green text-center pt-[clamp(1.25rem,8vh,6rem)] flex-shrink-0"
              >
                {renderTitle(page)}
              </h2>
              {page.subtitle && (
                <p
                  ref={el => { subtitleRefs.current[i] = el }}
                  className="text-xl sm:text-2xl font-semibold text-text-primary text-center mt-[clamp(0.25rem,2vh,1rem)] flex-shrink-0"
                >
                  {page.subtitle}
                </p>
              )}
              <div className="flex-1 w-full min-h-0 flex items-center justify-center py-[clamp(0.5rem,4vh,2rem)] overflow-hidden">
                <div className="w-full flex flex-col gap-8">
                  {renderPageContent(page.id, playTokens[i], resetTokens[i])}
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      <nav className="flex sm:hidden gap-1.5 fixed top-32 left-4 right-4 z-20">
        {pages.map((page, i) => (
          <button
            key={page.id}
            onClick={() => goToPage(i)}
            aria-label={page.title}
            className="flex-1 h-1 rounded-full overflow-hidden bg-text-disabled/30"
          >
            <span className={`block h-full rounded-full transition-colors duration-300 ${i === activeIndex ? 'bg-primary' : 'bg-transparent'}`} />
          </button>
        ))}
      </nav>

      <nav className="hidden sm:flex flex-col gap-3 fixed right-5 top-1/2 -translate-y-1/2 z-20">
        {pages.map((page, i) => (
          <button
            key={page.id}
            onClick={() => goToPage(i)}
            aria-label={page.title}
            className="group relative flex items-center justify-end py-1"
          >
            <span
              className={`absolute right-full mr-3 whitespace-nowrap rounded-md bg-bg-secondary border border-border px-2 py-1 ${textStyles.caption} text-text-primary opacity-0 translate-x-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-0 pointer-events-none`}
            >
              {page.title}
            </span>
            <span
              className={`block rounded-full transition-all duration-300 ${
                i === activeIndex ? 'w-2.5 h-2.5 bg-primary' : 'w-2 h-2 bg-text-disabled group-hover:bg-text-secondary'
              }`}
            />
          </button>
        ))}
      </nav>
    </div>
  )
}
