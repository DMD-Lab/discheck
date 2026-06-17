import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PeriodSelector from '@/components/dashboard/collection/PeriodSelector'
import type { PeriodType } from '@/components/dashboard/collection/PeriodSelector'
import CollectionGlobalSection from '@/components/dashboard/collection/CollectionGlobalSection'
import type { CollectionGlobalStats } from '@/components/dashboard/collection/CollectionGlobalSection'
import CollectionGenreSection from '@/components/dashboard/collection/CollectionGenreSection'
import type { CollectionGenreData } from '@/components/dashboard/collection/CollectionGenreSection'
import CollectionDecadeSection from '@/components/dashboard/collection/CollectionDecadeSection'
import type { CollectionDecadeStat } from '@/components/dashboard/collection/CollectionDecadeSection'
import { COLLECTION_DECADES } from '@/components/dashboard/collection/CollectionDecadeSection'
import { getGenreColor } from '@/lib/genre-colors'
import CollectionArtistExplorationSection from '@/components/dashboard/collection/CollectionArtistExplorationSection'
import type { DepthItem } from '@/lib/insights/depth-insight'
import CollectionRecentActivitySection from '@/components/dashboard/collection/CollectionRecentActivitySection'
import type { RecentTrack, RecentAlbum } from '@/components/dashboard/collection/CollectionRecentActivitySection'

const VALID_PERIODS: PeriodType[] = ['30d', '3m', '1y', 'all']

function isValidPeriod(p: unknown): p is PeriodType {
  return VALID_PERIODS.includes(p as PeriodType)
}

function getPeriodDates(period: PeriodType) {
  if (period === 'all') {
    return { start: null, end: null, prevStart: null, prevEnd: null }
  }
  const now = new Date()
  let start: Date
  let prevStart: Date
  if (period === '30d') {
    start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    prevStart = new Date(start.getTime() - 30 * 24 * 60 * 60 * 1000)
  } else if (period === '3m') {
    start = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
    prevStart = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
  } else {
    start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
    prevStart = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate())
  }
  return {
    start: start.toISOString(),
    end: now.toISOString(),
    prevStart: prevStart.toISOString(),
    prevEnd: start.toISOString(),
  }
}

export default async function CollectionPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>
}) {
  const { period: periodParam } = await searchParams
  const period: PeriodType = isValidPeriod(periodParam) ? periodParam : '30d'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { start, end, prevStart, prevEnd } = getPeriodDates(period)

  const { data: allListened } = await supabase
    .from('listened_tracks')
    .select('track_deezer_id, album_deezer_id, listened_at, duration_seconds')
    .eq('user_id', user.id)

  const listened = allListened ?? []

  const current = start
    ? listened.filter(t => t.listened_at >= start && t.listened_at < end!)
    : listened
  const prev = prevStart
    ? listened.filter(t => t.listened_at >= prevStart && t.listened_at < prevEnd!)
    : null

  const albumAgg = new Map<number, { totalListened: number; maxDate: string }>()
  for (const t of listened) {
    const entry = albumAgg.get(t.album_deezer_id) ?? { totalListened: 0, maxDate: '' }
    entry.totalListened++
    if (!entry.maxDate || t.listened_at > entry.maxDate) entry.maxDate = t.listened_at
    albumAgg.set(t.album_deezer_id, entry)
  }

  function pct(curr: number, p: number | null): number | null {
    if (p === null || p === 0) return null
    return Math.round((curr - p) / p * 100)
  }

  function formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    if (h === 0) return `${m}m`
    if (m === 0) return `${h}h`
    return `${h}h ${m}m`
  }

  const trackCountMap = new Map<number, number>()
  const artistMap = new Map<number, number | null>()
  const albumGenreMap = new Map<number, number>()
  const genreNameMap = new Map<number, string>()
  let genreData: CollectionGenreData = { top: [], others: null, all: [] }
  let depthItems: DepthItem[] = []
  let recentTracks: RecentTrack[] = []
  let recentAlbums: RecentAlbum[] = []
  let decadeData: CollectionDecadeStat[] = COLLECTION_DECADES.map(decade => ({
    decade,
    label: decade >= 2000 ? `${decade}s` : `${String(decade).slice(2)}s`,
    count: 0,
    pctChange: null,
  }))
  const allAlbumIds = [...albumAgg.keys()]

  if (allAlbumIds.length > 0) {
    const [{ data: cachedTracks }, { data: albumMeta }, { data: allGenres }] = await Promise.all([
      supabase
        .from('cached_tracks')
        .select('track_deezer_id, album_deezer_id, track_data')
        .in('album_deezer_id', allAlbumIds),
      supabase
        .from('cached_albums')
        .select('album_deezer_id, artist_deezer_id, artist_name, title, cover_xl, genre_id, original_release_year')
        .in('album_deezer_id', allAlbumIds),
      supabase.from('cached_genres').select('deezer_id, name'),
    ])

    const trackInfoMap = new Map<number, string>()
    for (const t of cachedTracks ?? []) {
      trackCountMap.set(t.album_deezer_id, (trackCountMap.get(t.album_deezer_id) ?? 0) + 1)
      if (t.track_deezer_id) {
        const data = t.track_data as { title?: string } | null
        trackInfoMap.set(t.track_deezer_id, data?.title ?? '')
      }
    }
    for (const g of allGenres ?? []) {
      genreNameMap.set(g.deezer_id, g.name)
    }
    const albumYearMap = new Map<number, number>()
    const albumCoverMap = new Map<number, string>()
    const albumTitleMap = new Map<number, string>()
    const albumArtistNameMap = new Map<number, string>()
    for (const a of albumMeta ?? []) {
      artistMap.set(a.album_deezer_id, a.artist_deezer_id)
      if (a.genre_id) albumGenreMap.set(a.album_deezer_id, a.genre_id)
      if (a.original_release_year) albumYearMap.set(a.album_deezer_id, a.original_release_year)
      if (a.cover_xl) albumCoverMap.set(a.album_deezer_id, a.cover_xl)
      if (a.title) albumTitleMap.set(a.album_deezer_id, a.title)
      if (a.artist_name) albumArtistNameMap.set(a.album_deezer_id, a.artist_name)
    }

    const currentGenreCount = new Map<number, number>()
    for (const t of current) {
      const gId = albumGenreMap.get(t.album_deezer_id)
      if (gId) currentGenreCount.set(gId, (currentGenreCount.get(gId) ?? 0) + 1)
    }

    const prevGenreCount = new Map<number, number>()
    if (prev !== null) {
      for (const t of prev) {
        const gId = albumGenreMap.get(t.album_deezer_id)
        if (gId) prevGenreCount.set(gId, (prevGenreCount.get(gId) ?? 0) + 1)
      }
    }

    const sortedGenres = [...currentGenreCount.entries()]
      .filter(([genreId]) => genreId !== -1 && genreNameMap.has(genreId))
      .sort((a, b) => b[1] - a[1])
    const top4Ids = new Set(sortedGenres.slice(0, 4).map(([id]) => id))
    const othersGenres = sortedGenres.slice(4)
    const currentOthersCount = othersGenres.reduce((s, [, c]) => s + c, 0)
    const prevOthersCount = prev !== null
      ? [...prevGenreCount.entries()].filter(([id]) => !top4Ids.has(id)).reduce((s, [, c]) => s + c, 0)
      : null

    const allGenreStats = sortedGenres.map(([genreId, count]) => ({
      genreId,
      name: genreNameMap.get(genreId) ?? 'Inconnu',
      count,
      pctChange: pct(count, prev !== null ? (prevGenreCount.get(genreId) ?? 0) : null),
      color: getGenreColor(genreId),
    }))

    genreData = {
      top: allGenreStats.slice(0, 4),
      all: allGenreStats,
      others: othersGenres.length > 0 ? {
        count: currentOthersCount,
        pctChange: pct(currentOthersCount, prevOthersCount),
        otherCount: othersGenres.length,
      } : null,
    }

    const currentDecadeCount = new Map<number, number>()
    for (const t of current) {
      const year = albumYearMap.get(t.album_deezer_id)
      if (!year) continue
      const decade = Math.floor(year / 10) * 10
      currentDecadeCount.set(decade, (currentDecadeCount.get(decade) ?? 0) + 1)
    }

    const prevDecadeCount = new Map<number, number>()
    if (prev !== null) {
      for (const t of prev) {
        const year = albumYearMap.get(t.album_deezer_id)
        if (!year) continue
        const decade = Math.floor(year / 10) * 10
        prevDecadeCount.set(decade, (prevDecadeCount.get(decade) ?? 0) + 1)
      }
    }

    decadeData = COLLECTION_DECADES.map(decade => ({
      decade,
      label: decade >= 2000 ? `${decade}s` : `${String(decade).slice(2)}s`,
      count: currentDecadeCount.get(decade) ?? 0,
      pctChange: pct(currentDecadeCount.get(decade) ?? 0, prev !== null ? (prevDecadeCount.get(decade) ?? 0) : null),
    }))

    const artistDeezerIds = [...new Set((albumMeta ?? []).map(a => a.artist_deezer_id).filter((id): id is number => !!id))]
    if (artistDeezerIds.length > 0) {
      const [{ data: allArtistAlbums }, { data: cachedArtistsData }] = await Promise.all([
        supabase.from('cached_albums').select('album_deezer_id, artist_deezer_id').in('artist_deezer_id', artistDeezerIds),
        supabase.from('cached_artists').select('artist_deezer_id, artist_data').in('artist_deezer_id', artistDeezerIds),
      ])

      const listenedAlbumSet = new Set(allAlbumIds)

      const artistPictureMap = new Map<number, string>()
      for (const a of cachedArtistsData ?? []) {
        const raw = a.artist_data as { picture_xl?: string } | null
        if (raw?.picture_xl) artistPictureMap.set(a.artist_deezer_id, raw.picture_xl)
      }

      const artistNameMap = new Map<number, string>()
      for (const a of albumMeta ?? []) {
        if (a.artist_deezer_id && a.artist_name && !artistNameMap.has(a.artist_deezer_id)) {
          artistNameMap.set(a.artist_deezer_id, a.artist_name)
        }
      }

      const progressMap = new Map<number, { total: number; listened: number }>()
      for (const ca of allArtistAlbums ?? []) {
        if (!ca.artist_deezer_id) continue
        const curr = progressMap.get(ca.artist_deezer_id) ?? { total: 0, listened: 0 }
        progressMap.set(ca.artist_deezer_id, {
          total: curr.total + 1,
          listened: curr.listened + (listenedAlbumSet.has(ca.album_deezer_id) ? 1 : 0),
        })
      }

      depthItems = [...progressMap.entries()]
        .filter(([, p]) => p.listened > 0)
        .map(([artistId, p]) => ({
          artistDeezerId: artistId,
          name: artistNameMap.get(artistId) ?? '',
          pictureXl: artistPictureMap.get(artistId) ?? '',
          listened: p.listened,
          total: p.total,
          pct: Math.round((p.listened / p.total) * 100),
        }))
        .sort((a, b) => b.pct - a.pct || b.listened - a.listened)
    }

    const sortedByDate = [...current].sort((a, b) => b.listened_at.localeCompare(a.listened_at))
    recentTracks = sortedByDate
      .filter(t => t.track_deezer_id != null && trackInfoMap.has(t.track_deezer_id))
      .map(t => ({
        trackDeezerId: t.track_deezer_id!,
        title: trackInfoMap.get(t.track_deezer_id!)!,
        artistName: albumArtistNameMap.get(t.album_deezer_id) ?? '',
        coverXl: albumCoverMap.get(t.album_deezer_id) ?? '',
        listenedAt: t.listened_at,
      }))
    const currentAlbumMaxDate = new Map<number, string>()
    for (const t of current) {
      const existing = currentAlbumMaxDate.get(t.album_deezer_id)
      if (!existing || t.listened_at > existing) currentAlbumMaxDate.set(t.album_deezer_id, t.listened_at)
    }
    recentAlbums = [...currentAlbumMaxDate.entries()]
      .sort((a, b) => b[1].localeCompare(a[1]))
      .filter(([id]) => albumTitleMap.has(id))
      .map(([id, maxDate]) => ({ albumDeezerId: id, title: albumTitleMap.get(id) ?? '', artistName: albumArtistNameMap.get(id) ?? '', coverXl: albumCoverMap.get(id) ?? '', lastListenedAt: maxDate }))
  }

  // completion date = last track checked
  let albumsCompletedCurrent = 0
  let albumsCompletedPrev: number | null = prev !== null ? 0 : null

  for (const [albumId, agg] of albumAgg) {
    const trackCount = trackCountMap.get(albumId)
    if (!trackCount || agg.totalListened < trackCount) continue
    const inCurrent = start ? agg.maxDate >= start && agg.maxDate < end! : true
    if (inCurrent) albumsCompletedCurrent++
    if (prevStart && agg.maxDate >= prevStart && agg.maxDate < prevEnd!) {
      if (albumsCompletedPrev !== null) albumsCompletedPrev++
    }
  }

  const currentAlbumIds = new Set(current.map(t => t.album_deezer_id))
  const prevAlbumIds = new Set(prev?.map(t => t.album_deezer_id) ?? [])
  const artistsCurrent = new Set<number>()
  const artistsPrev = new Set<number>()

  for (const [albumId, artistId] of artistMap) {
    if (!artistId) continue
    if (currentAlbumIds.has(albumId)) artistsCurrent.add(artistId)
    if (prevAlbumIds.has(albumId)) artistsPrev.add(artistId)
  }

  const tracksCurrentCount = current.length
  const tracksPrevCount = prev?.length ?? null
  const secondsCurrent = current.reduce((s, t) => s + (t.duration_seconds ?? 0), 0)
  const secondsPrev = prev !== null ? prev.reduce((s, t) => s + (t.duration_seconds ?? 0), 0) : null
  const minutesCurrent = Math.floor(secondsCurrent / 60)
  const minutesPrev = secondsPrev !== null ? Math.floor(secondsPrev / 60) : null

  const stats: CollectionGlobalStats = {
    tracksListened: {
      value: tracksCurrentCount.toLocaleString('fr-FR'),
      pctChange: pct(tracksCurrentCount, tracksPrevCount),
    },
    albumsCompleted: {
      value: albumsCompletedCurrent.toLocaleString('fr-FR'),
      pctChange: pct(albumsCompletedCurrent, albumsCompletedPrev),
    },
    listeningTimeHours: {
      value: formatTime(secondsCurrent),
      pctChange: pct(minutesCurrent, minutesPrev),
    },
    artistsExplored: {
      value: artistsCurrent.size.toLocaleString('fr-FR'),
      pctChange: prev !== null ? pct(artistsCurrent.size, artistsPrev.size) : null,
    },
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <Suspense>
          <PeriodSelector current={period} />
        </Suspense>
      </div>
      <CollectionGlobalSection stats={stats} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2 xl:col-span-2 2xl:col-span-1">
          <CollectionGenreSection data={genreData} />
        </div>
        <div className="lg:col-span-2 xl:col-span-2 2xl:col-span-1">
          <CollectionDecadeSection data={decadeData} />
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <CollectionArtistExplorationSection items={depthItems} />
        </div>
        <div>
          <CollectionRecentActivitySection
            recentTracks={recentTracks.slice(0, 5)}
            recentAlbums={recentAlbums.slice(0, 5)}
            allTracks={recentTracks}
            allAlbums={recentAlbums}
          />
        </div>
      </div>
    </div>
  )
}
