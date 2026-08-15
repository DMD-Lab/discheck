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

  const [
    { data: globalStatsRaw },
    { data: genreStatsRaw },
    { data: decadeStatsRaw },
    { data: depthStatsRaw },
    { data: recentTracksRaw },
    { data: recentAlbumsRaw },
  ] = await Promise.all([
    supabase.rpc('get_collection_global_stats', {
      p_user_id: user.id,
      p_start: start,
      p_end: end,
      p_prev_start: prevStart,
      p_prev_end: prevEnd,
    }).single(),
    supabase.rpc('get_collection_genre_stats', {
      p_user_id: user.id,
      p_start: start,
      p_end: end,
      p_prev_start: prevStart,
      p_prev_end: prevEnd,
    }),
    supabase.rpc('get_collection_decade_stats', {
      p_user_id: user.id,
      p_start: start,
      p_end: end,
      p_prev_start: prevStart,
      p_prev_end: prevEnd,
    }),
    supabase.rpc('get_depth_stats', { p_user_id: user.id }),
    supabase.rpc('get_collection_recent_tracks', { p_user_id: user.id, p_start: start, p_end: end }),
    supabase.rpc('get_collection_recent_albums', { p_user_id: user.id, p_start: start, p_end: end }),
  ])

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

  type GenreRow = { genre_id: number; name: string; count: number; prev_count: number; total_prev_count: number }
  const genreRows = (genreStatsRaw ?? []) as GenreRow[]
  const allGenreStats = genreRows.map((r) => ({
    genreId: r.genre_id,
    name: r.name,
    count: r.count,
    pctChange: pct(r.count, r.prev_count),
    color: getGenreColor(r.genre_id),
  }))
  const topGenres = allGenreStats.slice(0, 4)
  const othersGenres = allGenreStats.slice(4)
  const currentOthersCount = othersGenres.reduce((s, gStat) => s + gStat.count, 0)
  const genreData: CollectionGenreData = {
    top: topGenres,
    all: allGenreStats,
    others: othersGenres.length > 0
      ? {
          count: currentOthersCount,
          pctChange: pct(
            currentOthersCount,
            genreRows[0].total_prev_count - genreRows.slice(0, 4).reduce((s, r) => s + r.prev_count, 0),
          ),
          otherCount: othersGenres.length,
        }
      : null,
  }

  type DecadeRow = { decade: number; count: number; prev_count: number }
  const decadeData: CollectionDecadeStat[] = ((decadeStatsRaw ?? []) as DecadeRow[]).map((r) => ({
    decade: r.decade,
    label: r.decade >= 2000 ? `${r.decade}s` : `${String(r.decade).slice(2)}s`,
    count: r.count,
    pctChange: pct(r.count, r.prev_count),
  }))

  type DepthRow = { artist_deezer_id: number; name: string; picture_xl: string; listened: number; total: number; pct: number }
  const depthItems: DepthItem[] = ((depthStatsRaw ?? []) as DepthRow[]).map((r) => ({
    artistDeezerId: r.artist_deezer_id,
    name: r.name,
    pictureXl: r.picture_xl,
    listened: r.listened,
    total: r.total,
    pct: r.pct,
  }))

  type RecentTrackRow = { track_deezer_id: number; title: string; artist_name: string; cover_xl: string; listened_at: string }
  const recentTracks: RecentTrack[] = ((recentTracksRaw ?? []) as RecentTrackRow[]).map((r) => ({
    trackDeezerId: r.track_deezer_id,
    title: r.title,
    artistName: r.artist_name,
    coverXl: r.cover_xl,
    listenedAt: r.listened_at,
  }))

  type RecentAlbumRow = { album_deezer_id: number; title: string; artist_name: string; cover_xl: string; last_listened_at: string }
  const recentAlbums: RecentAlbum[] = ((recentAlbumsRaw ?? []) as RecentAlbumRow[]).map((r) => ({
    albumDeezerId: r.album_deezer_id,
    title: r.title,
    artistName: r.artist_name,
    coverXl: r.cover_xl,
    lastListenedAt: r.last_listened_at,
  }))

  type GlobalStatsRow = {
    tracks_current: number
    tracks_prev: number | null
    albums_completed_current: number
    albums_completed_prev: number | null
    seconds_current: number
    seconds_prev: number | null
    artists_current: number
    artists_prev: number | null
  }
  const g = globalStatsRaw as GlobalStatsRow
  const minutesCurrent = Math.floor(g.seconds_current / 60)
  const minutesPrev = g.seconds_prev !== null ? Math.floor(g.seconds_prev / 60) : null

  const stats: CollectionGlobalStats = {
    tracksListened: {
      value: g.tracks_current.toLocaleString('fr-FR'),
      pctChange: pct(g.tracks_current, g.tracks_prev),
    },
    albumsCompleted: {
      value: g.albums_completed_current.toLocaleString('fr-FR'),
      pctChange: pct(g.albums_completed_current, g.albums_completed_prev),
    },
    listeningTimeHours: {
      value: formatTime(g.seconds_current),
      pctChange: pct(minutesCurrent, minutesPrev),
    },
    artistsExplored: {
      value: g.artists_current.toLocaleString('fr-FR'),
      pctChange: pct(g.artists_current, g.artists_prev),
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
