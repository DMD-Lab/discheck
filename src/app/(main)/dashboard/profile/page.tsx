import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getGenres } from "@/lib/deezer/api"
import { getGenreColor } from "@/lib/genre-colors"
import GenresSection from "@/components/dashboard/profile/GenresSection"
import DecadesSection from "@/components/dashboard/profile/DecadesSection"
import ListenerSection from "@/components/dashboard/profile/ListenerSection"
import { getGenreInsight } from "@/lib/insights/genre-insight"
import type { GenreStats } from "@/lib/insights/genre-insight"
import { getDecadeInsight, decadeLabel } from "@/lib/insights/decade-insight"
import type { DecadeStats } from "@/lib/insights/decade-insight"
import { getListenerInsight } from "@/lib/insights/listener-insight"
import type { ListenerStats } from "@/lib/insights/listener-insight"

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

  const { data: listenedAlbums } = await supabase
    .from("listened_tracks")
    .select("album_deezer_id")
    .eq("user_id", user.id)

  let genreStats: GenreStats[] = []
  const decadeStats: DecadeStats[] = []
  let listenerStats: ListenerStats = { albumFull: 0, albumPartial: 0, albumFullPct: 0, albumPartialPct: 0 }

  const uniqueAlbumIds = [
    ...new Set((listenedAlbums ?? []).map((t) => t.album_deezer_id).filter(Boolean)),
  ]

  if (uniqueAlbumIds.length > 0) {
    const { data: albumData } = await supabase
      .from("cached_albums")
      .select("album_deezer_id, genre_id, original_release_year, track_count, record_type")
      .in("album_deezer_id", uniqueAlbumIds)

    // genres
    const albumGenreMap = new Map<number, number>()
    for (const a of albumData ?? []) {
      if (a.genre_id) albumGenreMap.set(a.album_deezer_id, a.genre_id)
    }

    const genreCountMap = new Map<number, number>()
    for (const track of listenedAlbums ?? []) {
      const genreId = albumGenreMap.get(track.album_deezer_id)
      if (genreId) genreCountMap.set(genreId, (genreCountMap.get(genreId) ?? 0) + 1)
    }

    const genreIds = [...genreCountMap.keys()]
    if (genreIds.length > 0) {
      const { data: genreNames } = await supabase
        .from("cached_genres")
        .select("deezer_id, name")
        .in("deezer_id", genreIds)

      const total = [...genreCountMap.values()].reduce((a, b) => a + b, 0)

      genreStats = [...genreCountMap.entries()]
        .map(([genreId, count]) => {
          const genre = genreNames?.find((g) => g.deezer_id === genreId)
          return {
            genreId,
            name: genre?.name ?? "Inconnu",
            count,
            percentage: Math.round((count / total) * 100),
            color: getGenreColor(genreId),
          }
        })
        .sort((a, b) => b.count - a.count)
    }

    // decades
    const albumYearMap = new Map<number, number>()
    for (const a of albumData ?? []) {
      if (a.original_release_year) albumYearMap.set(a.album_deezer_id, a.original_release_year)
    }

    const decadeCountMap = new Map<number, number>()
    for (const track of listenedAlbums ?? []) {
      const year = albumYearMap.get(track.album_deezer_id)
      if (!year) continue
      const decade = Math.floor(year / 10) * 10
      decadeCountMap.set(decade, (decadeCountMap.get(decade) ?? 0) + 1)
    }

    if (decadeCountMap.size > 0) {
      const total = [...decadeCountMap.values()].reduce((a, b) => a + b, 0)
      const minDecade = Math.min(...decadeCountMap.keys())
      const maxDecade = 2020
      for (let d = minDecade; d <= maxDecade; d += 10) {
        const count = decadeCountMap.get(d) ?? 0
        decadeStats.push({
          decade: d,
          label: decadeLabel(d),
          count,
          percentage: count > 0 ? Math.round((count / total) * 100) : 0,
        })
      }
    }

    // listener stats (albums & EPs uniquement)
    const albumRecordTypeMap = new Map<number, string>()
    for (const a of albumData ?? []) {
      if (a.record_type) albumRecordTypeMap.set(a.album_deezer_id, a.record_type)
    }

    const albumEpSet = new Set(
      uniqueAlbumIds.filter(id => {
        const rt = albumRecordTypeMap.get(id)
        return rt === 'album' || rt === 'ep'
      })
    )

    if (albumEpSet.size > 0) {
      const { data: cachedTracksData } = await supabase
        .from("cached_tracks")
        .select("album_deezer_id")
        .in("album_deezer_id", [...albumEpSet])

      const cachedTrackCountMap = new Map<number, number>()
      for (const t of cachedTracksData ?? []) {
        cachedTrackCountMap.set(t.album_deezer_id, (cachedTrackCountMap.get(t.album_deezer_id) ?? 0) + 1)
      }

      const listenedCountPerAlbum = new Map<number, number>()
      for (const track of listenedAlbums ?? []) {
        if (!albumEpSet.has(track.album_deezer_id)) continue
        listenedCountPerAlbum.set(
          track.album_deezer_id,
          (listenedCountPerAlbum.get(track.album_deezer_id) ?? 0) + 1
        )
      }

      let albumFull = 0
      let albumPartial = 0
      for (const [albumId, listenedCount] of listenedCountPerAlbum) {
        const totalCount = cachedTrackCountMap.get(albumId)
        if (!totalCount) continue
        if (listenedCount >= totalCount) albumFull++
        else albumPartial++
      }

      const listenerTotal = albumFull + albumPartial
      if (listenerTotal > 0) {
        listenerStats = {
          albumFull,
          albumPartial,
          albumFullPct: Math.round((albumFull / listenerTotal) * 100),
          albumPartialPct: Math.round((albumPartial / listenerTotal) * 100),
        }
      }
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <GenresSection genres={genreStats} insight={getGenreInsight(genreStats)} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <DecadesSection decades={decadeStats} insight={getDecadeInsight(decadeStats)} />
        <ListenerSection stats={listenerStats} insight={getListenerInsight(listenerStats)} />
      </div>
    </div>
  )
}
