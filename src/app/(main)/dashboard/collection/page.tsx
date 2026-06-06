import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PeriodSelector from '@/components/dashboard/collection/PeriodSelector'
import type { PeriodType } from '@/components/dashboard/collection/PeriodSelector'
import CollectionGlobalSection from '@/components/dashboard/collection/CollectionGlobalSection'
import type { CollectionGlobalStats } from '@/components/dashboard/collection/CollectionGlobalSection'

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
    .select('album_deezer_id, listened_at, duration_seconds')
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

  const trackCountMap = new Map<number, number>()
  const artistMap = new Map<number, number | null>()
  const allAlbumIds = [...albumAgg.keys()]

  if (allAlbumIds.length > 0) {
    const [{ data: cachedTracks }, { data: albumMeta }] = await Promise.all([
      supabase
        .from('cached_tracks')
        .select('album_deezer_id')
        .in('album_deezer_id', allAlbumIds),
      supabase
        .from('cached_albums')
        .select('album_deezer_id, artist_deezer_id')
        .in('album_deezer_id', allAlbumIds),
    ])

    for (const t of cachedTracks ?? []) {
      trackCountMap.set(t.album_deezer_id, (trackCountMap.get(t.album_deezer_id) ?? 0) + 1)
    }

    for (const a of albumMeta ?? []) {
      artistMap.set(a.album_deezer_id, a.artist_deezer_id)
    }
  }

  const tracksCurrentCount = current.length
  const tracksPrevCount = prev?.length ?? null

  const secondsCurrent = current.reduce((s, t) => s + (t.duration_seconds ?? 0), 0)
  const secondsPrev = prev !== null
    ? prev.reduce((s, t) => s + (t.duration_seconds ?? 0), 0)
    : null

  function pct(current: number, prev: number | null): number | null {
    if (prev === null || prev === 0) return null
    return Math.round((current - prev) / prev * 100)
  }

  function formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    if (h === 0) return `${m}m`
    if (m === 0) return `${h}h`
    return `${h}h ${m}m`
  }

  // completion date = last track checked
  let albumsCompletedCurrent = 0
  let albumsCompletedPrev: number | null = prev !== null ? 0 : null

  for (const [albumId, agg] of albumAgg) {
    const trackCount = trackCountMap.get(albumId)
    if (!trackCount || agg.totalListened < trackCount) continue

    const inCurrent = start
      ? agg.maxDate >= start && agg.maxDate < end!
      : true
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
    </div>
  )
}
