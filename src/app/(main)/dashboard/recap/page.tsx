import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RecapPicker from '@/components/dashboard/recap/RecapPicker'
import type { PickerMode } from '@/components/dashboard/recap/RecapPicker'
import RecapScrollPages from '@/components/dashboard/recap/RecapScrollPages'
import RecapEmptyState from '@/components/dashboard/recap/RecapEmptyState'
import type { RecapSummary } from '@/components/dashboard/recap/RecapSummarySection'
import type { RecapArtist } from '@/components/dashboard/recap/RecapTopArtistsSection'
import type { FavoriteTrack, FavoriteAlbum } from '@/components/dashboard/recap/RecapFavoritesSection'
import type { ListenedTrack, ListenedAlbum } from '@/components/dashboard/recap/RecapListenedSection'
import type { DiscoveredArtist } from '@/components/dashboard/recap/RecapDiscoveredArtistsSection'
import { periodSuffix, periodThis, periodAt, monthWithPreposition } from '@/lib/period-label'

function pickRandom<T>(items: T[], count: number): T[] {
  const shuffled = [...items]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, count)
}

function pickBackgroundCovers(tracks: ListenedTrack[], count: number): string[] {
  const withCover = tracks.filter(t => t.coverXl)
  if (withCover.length === 0) return []

  const shuffled = pickRandom(withCover, withCover.length)
  const covers: string[] = []
  const seen = new Set<string>()
  for (const track of shuffled) {
    if (seen.has(track.coverXl)) continue
    seen.add(track.coverXl)
    covers.push(track.coverXl)
    if (covers.length === count) break
  }
  return covers
}

// no bounding, malformed only
function sanitizePeriod(yearInput: number, monthInput: number, now: Date) {
  const year = Number.isFinite(yearInput) ? yearInput : now.getFullYear()
  const month = Number.isFinite(monthInput) && monthInput >= 1 && monthInput <= 12 ? monthInput : now.getMonth() + 1
  return { year, month }
}

export default async function RecapPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; year?: string; month?: string }>
}) {
  const { mode: modeParam, year: yearParam, month: monthParam } = await searchParams
  const mode: PickerMode = modeParam === 'year' ? 'year' : 'month'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('created_at').eq('id', user.id).single()
  const createdAt = profile?.created_at ? new Date(profile.created_at) : new Date()

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  const { year, month } = sanitizePeriod(Number(yearParam), Number(monthParam), now)
  const isCurrentPeriod = mode === 'year' ? year === currentYear : year === currentYear && month === currentMonth

  const start = mode === 'year' ? new Date(year, 0, 1) : new Date(year, month - 1, 1)
  const end = mode === 'year' ? new Date(year + 1, 0, 1) : new Date(year, month, 1)

  const [
    { data: summaryRaw },
    { data: topArtistsRaw },
    { data: favoriteTrackRaw },
    { data: favoriteAlbumRaw },
    { data: listenedTrackRaw },
    { data: listenedAlbumRaw },
    { data: discoveredRaw },
    { data: discoveryHistoryRaw },
  ] = await Promise.all([
    supabase.rpc('get_month_summary', { p_user_id: user.id, p_start: start.toISOString(), p_end: end.toISOString() }).single(),
    supabase.rpc('get_month_top_artists', { p_user_id: user.id, p_start: start.toISOString(), p_end: end.toISOString(), p_limit: null }),
    supabase.rpc('get_month_favorite_track', { p_user_id: user.id, p_start: start.toISOString(), p_end: end.toISOString(), p_limit: 5 }),
    supabase.rpc('get_month_favorite_album', { p_user_id: user.id, p_start: start.toISOString(), p_end: end.toISOString(), p_limit: 5 }),
    supabase.rpc('get_month_listened_tracks', { p_user_id: user.id, p_start: start.toISOString(), p_end: end.toISOString(), p_limit: null }),
    supabase.rpc('get_month_listened_albums', { p_user_id: user.id, p_start: start.toISOString(), p_end: end.toISOString(), p_limit: 5 }),
    supabase.rpc('get_month_discovered_artists', { p_user_id: user.id, p_start: start.toISOString(), p_end: end.toISOString() }),
    supabase.rpc('get_artist_discovery_history', { p_user_id: user.id }),
  ])

  type SummaryRow = { tracks_listened: number; hours_listened: number; artists_listened: number; albums_listened: number }
  const s = summaryRaw as SummaryRow | null
  const summary: RecapSummary = {
    tracksListened: s?.tracks_listened ?? 0,
    hoursListened: s?.hours_listened ?? 0,
    artistsListened: s?.artists_listened ?? 0,
    albumsListened: s?.albums_listened ?? 0,
  }

  type TopArtistRow = { artist_deezer_id: number; name: string; picture_xl: string; tracks_listened: number }
  const topArtists: RecapArtist[] = ((topArtistsRaw ?? []) as TopArtistRow[]).map(r => ({
    artistDeezerId: r.artist_deezer_id,
    name: r.name,
    pictureXl: r.picture_xl,
    tracksListened: r.tracks_listened,
  }))

  type FavoriteTrackRow = { track_deezer_id: number; rated_at: string }
  const favTrackRows = (favoriteTrackRaw ?? []) as FavoriteTrackRow[]
  let favoriteTracks: FavoriteTrack[] = []
  if (favTrackRows.length > 0) {
    const trackIds = favTrackRows.map(r => r.track_deezer_id)
    const { data: tracksData } = await supabase
      .from('cached_tracks')
      .select('track_deezer_id, album_deezer_id, track_data')
      .in('track_deezer_id', trackIds)

    const albumIds = [...new Set((tracksData ?? []).map(t => t.album_deezer_id))]
    const { data: albumsData } = await supabase
      .from('cached_albums')
      .select('album_deezer_id, artist_name, artist_deezer_id, cover_xl')
      .in('album_deezer_id', albumIds)

    favoriteTracks = favTrackRows.map(r => {
      const track = (tracksData ?? []).find(t => t.track_deezer_id === r.track_deezer_id)
      const album = (albumsData ?? []).find(a => a.album_deezer_id === track?.album_deezer_id)
      return {
        trackDeezerId: r.track_deezer_id,
        title: (track?.track_data as { title?: string })?.title ?? '',
        artistName: album?.artist_name ?? '',
        artistDeezerId: album?.artist_deezer_id ?? 0,
        coverXl: album?.cover_xl ?? '',
      }
    })
  }

  type FavoriteAlbumRow = {
    album_deezer_id: number
    album_rating: number
    rated_at: string
    track_avg: number | null
    has_any_track_rating: boolean
  }
  const favAlbumRows = (favoriteAlbumRaw ?? []) as FavoriteAlbumRow[]
  let favoriteAlbums: FavoriteAlbum[] = []
  if (favAlbumRows.length > 0) {
    const albumIds = favAlbumRows.map(r => r.album_deezer_id)
    const { data: albumsData } = await supabase
      .from('cached_albums')
      .select('album_deezer_id, title, artist_name, artist_deezer_id, cover_xl, record_type')
      .in('album_deezer_id', albumIds)

    favoriteAlbums = favAlbumRows.map(r => {
      const album = (albumsData ?? []).find(a => a.album_deezer_id === r.album_deezer_id)
      return {
        albumDeezerId: r.album_deezer_id,
        title: album?.title ?? '',
        artistName: album?.artist_name ?? '',
        artistDeezerId: album?.artist_deezer_id ?? 0,
        coverXl: album?.cover_xl ?? '',
        recordType: album?.record_type ?? 'album',
        albumRating: r.album_rating,
        trackAvg: r.track_avg,
      }
    })
  }

  type ListenedTrackRow = { track_deezer_id: number; listened_at: string; rating: number | null }
  const listenedTrackRows = (listenedTrackRaw ?? []) as ListenedTrackRow[]
  let listenedTracksAll: ListenedTrack[] = []
  if (listenedTrackRows.length > 0) {
    const trackIds = listenedTrackRows.map(r => r.track_deezer_id)
    const { data: tracksData } = await supabase
      .from('cached_tracks')
      .select('track_deezer_id, album_deezer_id, track_data')
      .in('track_deezer_id', trackIds)

    const albumIds = [...new Set((tracksData ?? []).map(t => t.album_deezer_id))]
    const { data: albumsData } = await supabase
      .from('cached_albums')
      .select('album_deezer_id, artist_name, artist_deezer_id, cover_xl')
      .in('album_deezer_id', albumIds)

    listenedTracksAll = listenedTrackRows.map(r => {
      const track = (tracksData ?? []).find(t => t.track_deezer_id === r.track_deezer_id)
      const album = (albumsData ?? []).find(a => a.album_deezer_id === track?.album_deezer_id)
      return {
        trackDeezerId: r.track_deezer_id,
        title: (track?.track_data as { title?: string })?.title ?? '',
        artistName: album?.artist_name ?? '',
        artistDeezerId: album?.artist_deezer_id ?? 0,
        coverXl: album?.cover_xl ?? '',
        rating: r.rating,
        listenedAt: r.listened_at,
      }
    })
  }
  const listenedTracks = listenedTracksAll.slice(0, 5)

  type ListenedAlbumRow = {
    album_deezer_id: number
    last_listened_at: string
    album_rating: number | null
    track_avg: number | null
    has_any_track_rating: boolean
  }
  const listenedAlbumRows = (listenedAlbumRaw ?? []) as ListenedAlbumRow[]
  let listenedAlbums: ListenedAlbum[] = []
  if (listenedAlbumRows.length > 0) {
    const albumIds = listenedAlbumRows.map(r => r.album_deezer_id)
    const { data: albumsData } = await supabase
      .from('cached_albums')
      .select('album_deezer_id, title, artist_name, artist_deezer_id, cover_xl, record_type')
      .in('album_deezer_id', albumIds)

    listenedAlbums = listenedAlbumRows.map(r => {
      const album = (albumsData ?? []).find(a => a.album_deezer_id === r.album_deezer_id)
      return {
        albumDeezerId: r.album_deezer_id,
        title: album?.title ?? '',
        artistName: album?.artist_name ?? '',
        artistDeezerId: album?.artist_deezer_id ?? 0,
        coverXl: album?.cover_xl ?? '',
        recordType: album?.record_type ?? 'album',
        albumRating: r.album_rating,
        trackAvg: r.track_avg,
        lastListenedAt: r.last_listened_at,
      }
    })
  }

  const tracksListenedByArtist = new Map(topArtists.map(a => [a.artistDeezerId, a.tracksListened]))

  type DiscoveredRow = { artist_deezer_id: number; name: string; picture_xl: string; first_listened_at: string }
  const discoveredArtists: DiscoveredArtist[] = ((discoveredRaw ?? []) as DiscoveredRow[]).map(r => ({
    artistDeezerId: r.artist_deezer_id,
    name: r.name,
    pictureXl: r.picture_xl,
    tracksListened: tracksListenedByArtist.get(r.artist_deezer_id) ?? 0,
  }))

  type DiscoveryHistoryRow = { artist_deezer_id: number; discovery_month: string; tracks_in_month: number; tracks_in_year: number }
  const discoveryHistory = (discoveryHistoryRaw ?? []) as DiscoveryHistoryRow[]
  const currentPeriodKey = mode === 'year' ? String(year) : `${year}-${String(month).padStart(2, '0')}`
  const periodKeyOf = (row: DiscoveryHistoryRow) => mode === 'year' ? row.discovery_month.slice(0, 4) : row.discovery_month.slice(0, 7)
  const tracksForMode = (row: DiscoveryHistoryRow) => mode === 'year' ? row.tracks_in_year : row.tracks_in_month

  const otherPeriods = discoveryHistory.filter(row => periodKeyOf(row) !== currentPeriodKey)
  const discoveryCountsByOtherPeriod = new Map<string, number>()
  for (const row of otherPeriods) {
    const key = periodKeyOf(row)
    discoveryCountsByOtherPeriod.set(key, (discoveryCountsByOtherPeriod.get(key) ?? 0) + 1)
  }
  const maxOtherDiscoveryCount = discoveryCountsByOtherPeriod.size > 0 ? Math.max(...discoveryCountsByOtherPeriod.values()) : 0
  const isDiscoveryCountRecord = discoveryCountsByOtherPeriod.size > 0 && discoveredArtists.length >= maxOtherDiscoveryCount && discoveredArtists.length > 0

  const maxOtherDiscoveryTracks = otherPeriods.length > 0 ? Math.max(...otherPeriods.map(tracksForMode)) : 0

  const earliestDiscoveryMonth = discoveryHistory.length > 0
    ? discoveryHistory.reduce((min, r) => (r.discovery_month < min ? r.discovery_month : min), discoveryHistory[0].discovery_month)
    : null
  const minYear = earliestDiscoveryMonth ? Number(earliestDiscoveryMonth.slice(0, 4)) : createdAt.getFullYear()
  const minMonth = earliestDiscoveryMonth ? Number(earliestDiscoveryMonth.slice(5, 7)) : createdAt.getMonth() + 1

  const backgroundCovers = pickBackgroundCovers(listenedTracksAll, 6)

  const isEmpty = summary.tracksListened === 0

  return (
    <div className="flex flex-col gap-6 flex-1">
      <Suspense>
        <RecapPicker mode={mode} year={year} month={month} minYear={minYear} minMonth={minMonth} />
      </Suspense>

      {isEmpty ? (
        isCurrentPeriod ? (
          <RecapEmptyState
            message={`Tu n'as rien écouté ${periodThis(mode)} pour le moment.\nTes écoutes apparaîtront ici automatiquement.`}
            ctaLabel="Rechercher de la musique"
            ctaHref="/search"
          />
        ) : (
          <RecapEmptyState
            message={<>Aucune écoute enregistrée <span className="text-text-green">{periodAt(mode, year, month)}</span>.</>}
            ctaLabel="Voir le mois en cours"
            ctaHref="/dashboard/recap"
          />
        )
      ) : (
        <RecapScrollPages
          mode={mode}
          introTitle={mode === 'year' ? `Ton année ${year}` : `Ton mois ${monthWithPreposition(month)} ${year}`}
          summary={summary}
          backgroundCovers={backgroundCovers}
          topArtists={topArtists}
          artistTitle="Mon artiste favori"
          favoriteTracks={favoriteTracks}
          favoriteAlbums={favoriteAlbums}
          favoritesTitle={`Tes favoris ${periodSuffix(mode)}`}
          listenedTracks={listenedTracks}
          listenedAlbums={listenedAlbums}
          listenedTitle={`Ce que tu as écouté ${periodThis(mode)}`}
          discoveredArtists={discoveredArtists}
          discoveredTitle={`Tes découvertes ${periodSuffix(mode)}`}
          isDiscoveryCountRecord={isDiscoveryCountRecord}
          maxDiscoveryTracksEver={maxOtherDiscoveryTracks}
          start={start.toISOString()}
          end={end.toISOString()}
        />
      )}
    </div>
  )
}
