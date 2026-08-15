import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getGenres } from "@/lib/deezer/api"
import { getGenreColor } from "@/lib/genre-colors"
import GenresSection from "@/components/dashboard/profile/GenresSection"
import DecadesSection from "@/components/dashboard/profile/DecadesSection"
import ListenerSection from "@/components/dashboard/profile/ListenerSection"
import ConcentrationSection from "@/components/dashboard/profile/ConcentrationSection"
import { getGenreInsight } from "@/lib/insights/genre-insight"
import type { GenreStats } from "@/lib/insights/genre-insight"
import { getDecadeInsight, decadeLabel } from "@/lib/insights/decade-insight"
import type { DecadeStats } from "@/lib/insights/decade-insight"
import { getListenerInsight } from "@/lib/insights/listener-insight"
import type { ListenerStats } from "@/lib/insights/listener-insight"
import { getConcentrationInsight } from "@/lib/insights/concentration-insight"
import type { ConcentrationStats } from "@/lib/insights/concentration-insight"
import CritiqueSection from "@/components/dashboard/profile/CritiqueSection"
import { emptyCritiqueModeStats } from "@/lib/insights/critique-insight"
import type { CritiqueStats, CritiqueModeStats } from "@/lib/insights/critique-insight"
import EcartSection from "@/components/dashboard/profile/EcartSection"
import type { EcartItem } from "@/lib/insights/ecart-insight"
import DepthSection from "@/components/dashboard/profile/DepthSection"
import type { DepthItem } from "@/lib/insights/depth-insight"

const GENRES_TTL_MS = 7 * 24 * 60 * 60 * 1000

async function refreshGenresIfStale() {
  const supabase = await createClient()

  const { data: latest } = await supabase
    .from("cached_genres")
    .select("cached_at")
    .order("cached_at", { ascending: false })
    .limit(1)
    .single()

  const isStale =
    !latest ||
    Date.now() - new Date(latest.cached_at).getTime() > GENRES_TTL_MS

  if (!isStale) return

  const { data: genresData } = await getGenres()
  const rows = genresData
    .filter((g) => g.id !== 0)
    .map((g) => ({
      deezer_id: g.id,
      name: g.name,
      cached_at: new Date().toISOString(),
    }))

  await supabase.from("cached_genres").upsert(rows, { onConflict: "deezer_id" })
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  await refreshGenresIfStale()

  const [
    { data: genreStatsRaw },
    { data: decadeStatsRaw },
    { data: listenerStatsRaw },
    { data: concentrationStatsRaw },
    { data: critiqueStatsRaw },
    { data: ecartStatsRaw },
    { data: depthStatsRaw },
  ] = await Promise.all([
    supabase.rpc("get_genre_stats", { p_user_id: user.id }),
    supabase.rpc("get_decade_stats", { p_user_id: user.id }),
    supabase.rpc("get_listener_stats", { p_user_id: user.id }).single(),
    supabase.rpc("get_concentration_stats", { p_user_id: user.id }),
    supabase.rpc("get_critique_stats", { p_user_id: user.id }),
    supabase.rpc("get_ecart_stats", { p_user_id: user.id }),
    supabase.rpc("get_depth_stats", { p_user_id: user.id }),
  ])

  type GenreStatsRow = { genre_id: number; name: string; count: number; percentage: number }
  const genreStats: GenreStats[] = ((genreStatsRaw ?? []) as GenreStatsRow[]).map((r) => ({
    genreId: r.genre_id,
    name: r.name,
    count: r.count,
    percentage: r.percentage,
    color: getGenreColor(r.genre_id),
  }))

  type DecadeStatsRow = { decade: number; count: number; percentage: number }
  const decadeStats: DecadeStats[] = ((decadeStatsRaw ?? []) as DecadeStatsRow[]).map((r) => ({
    decade: r.decade,
    label: decadeLabel(r.decade),
    count: r.count,
    percentage: r.percentage,
  }))

  type ListenerStatsRow = { album_full: number; album_partial: number; album_full_pct: number; album_partial_pct: number }
  const listenerRow = listenerStatsRaw as ListenerStatsRow | null
  const listenerStats: ListenerStats = listenerRow
    ? {
        albumFull: listenerRow.album_full,
        albumPartial: listenerRow.album_partial,
        albumFullPct: listenerRow.album_full_pct,
        albumPartialPct: listenerRow.album_partial_pct,
      }
    : { albumFull: 0, albumPartial: 0, albumFullPct: 0, albumPartialPct: 0 }

  type ConcentrationRow = { name: string; pct: number; total_tracks: number; total_artists: number; top3_pct: number }
  const concentrationRows = (concentrationStatsRaw ?? []) as ConcentrationRow[]
  const concentrationStats: ConcentrationStats = concentrationRows.length > 0
    ? {
        top3Pct: concentrationRows[0].top3_pct,
        totalTracks: concentrationRows[0].total_tracks,
        totalArtists: concentrationRows[0].total_artists,
        top3Artists: concentrationRows.map((r) => ({ name: r.name, pct: r.pct })),
      }
    : { top3Pct: 0, totalTracks: 0, totalArtists: 0, top3Artists: [] }

  type EcartRow = {
    album_deezer_id: number
    title: string
    artist_name: string
    cover_xl: string
    album_rating: number
    track_avg: number
    diff: number
  }
  const ecartItems: EcartItem[] = ((ecartStatsRaw ?? []) as EcartRow[]).map((r) => ({
    albumDeezerId: r.album_deezer_id,
    title: r.title,
    artistName: r.artist_name,
    coverXl: r.cover_xl,
    albumRating: r.album_rating,
    trackAvg: r.track_avg,
    diff: r.diff,
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

  type CritiqueRow = {
    mode: 'albums' | 'tracks'
    cnt_1: number; cnt_2: number; cnt_3: number; cnt_4: number; cnt_5: number
    average: number
    total: number
  }
  const critiqueRows = (critiqueStatsRaw ?? []) as CritiqueRow[]
  function toModeStats(mode: 'albums' | 'tracks'): CritiqueModeStats {
    const r = critiqueRows.find((row) => row.mode === mode)
    if (!r) return emptyCritiqueModeStats()
    return {
      distribution: { 1: r.cnt_1, 2: r.cnt_2, 3: r.cnt_3, 4: r.cnt_4, 5: r.cnt_5 },
      average: r.average,
      total: r.total,
    }
  }

  const critiqueStats: CritiqueStats = {
    albums: toModeStats('albums'),
    tracks: toModeStats('tracks'),
  }

  return (
    <div className="flex flex-col gap-6">
      <GenresSection genres={genreStats} insight={getGenreInsight(genreStats)} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DecadesSection decades={decadeStats} insight={getDecadeInsight(decadeStats)} />
        <ListenerSection stats={listenerStats} insight={getListenerInsight(listenerStats)} />
        <ConcentrationSection stats={concentrationStats} insight={getConcentrationInsight(concentrationStats)} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-full xl:col-span-2">
          <CritiqueSection stats={critiqueStats} />
        </div>
        <div className="lg:col-span-full xl:col-span-3">
          <EcartSection items={ecartItems} />
        </div>
      </div>
      <DepthSection items={depthItems} />
    </div>
  )
}
