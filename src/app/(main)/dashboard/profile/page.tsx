import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getGenres } from "@/lib/deezer/api"
import { getGenreColor } from "@/lib/genre-colors"
import GenresSection from "@/components/dashboard/profile/GenresSection"
import { getGenreInsight } from "@/lib/insights/genre-insight"
import type { GenreStats } from "@/lib/insights/genre-insight"

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

  const uniqueAlbumIds = [
    ...new Set((listenedAlbums ?? []).map((t) => t.album_deezer_id).filter(Boolean)),
  ]

  if (uniqueAlbumIds.length > 0) {
    const { data: albumGenres } = await supabase
      .from("cached_albums")
      .select("album_deezer_id, genre_id")
      .in("album_deezer_id", uniqueAlbumIds)

    const albumGenreMap = new Map<number, number>()
    for (const a of albumGenres ?? []) {
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
  }

  return (
    <div className="flex flex-col gap-6">
      <GenresSection genres={genreStats} insight={getGenreInsight(genreStats)} />
    </div>
  )
}
