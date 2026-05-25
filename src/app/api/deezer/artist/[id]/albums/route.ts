import { NextRequest, NextResponse } from 'next/server'
import { getArtistDiscography } from '@/lib/deezer/api'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { searchArtistMbid, getArtistReleaseGroups, matchReleaseYear } from '@/lib/musicbrainz/api'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const artistId = Number(id)

  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  // Lire le cache — albums du jour + original_release_year déjà enrichis
  const { data: cached } = await supabaseAdmin
    .from('cached_albums')
    .select('album_data, original_release_year, cached_at')
    .eq('artist_deezer_id', artistId)
    .gte('cached_at', today.toISOString())

  if (cached && cached.length > 0) {
    return NextResponse.json({
      data: cached.map(r => ({
        ...r.album_data,
        original_release_year: r.original_release_year ?? null,
      })),
    })
  }

  const [fresh, artistName] = await Promise.all([
    getArtistDiscography(artistId),
    supabaseAdmin
      .from('cached_artists')
      .select('artist_data')
      .eq('artist_deezer_id', artistId)
      .single()
      .then(({ data }) => (data?.artist_data as { name?: string })?.name ?? null),
  ])

  const yearMap = new Map<number, number | null>()

  // Dédupliquer par titre — garder l'entrée avec la date la plus ancienne
  if (fresh.data) {
    const seen = new Map<string, typeof fresh.data[0]>()
    fresh.data.forEach(album => {
      const key = album.title.toLowerCase().trim()
      const existing = seen.get(key)
      if (!existing || album.release_date < existing.release_date) {
        seen.set(key, album)
      }
    })
    fresh.data = Array.from(seen.values())
  }

  if (fresh.data?.length) {
    // Récupérer les original_release_year déjà connus pour ne pas les écraser
    const { data: existing } = await supabaseAdmin
      .from('cached_albums')
      .select('album_deezer_id, original_release_year')
      .eq('artist_deezer_id', artistId)

    ;(existing ?? []).forEach(r => yearMap.set(r.album_deezer_id, r.original_release_year))

    // Enrichir avec MusicBrainz si des albums n'ont pas encore d'année
    const albumsMissingYear = fresh.data.filter(a => !yearMap.get(a.id))
    if (albumsMissingYear.length > 0 && artistName) {
      try {
        const mbid = await searchArtistMbid(artistName)
        if (mbid) {
          const releaseGroups = await getArtistReleaseGroups(mbid)
          albumsMissingYear.forEach(album => {
            const year = matchReleaseYear(album.title, releaseGroups)
            if (year) yearMap.set(album.id, year)
          })
        }
      } catch {
        // MusicBrainz indisponible — on continue avec les données Deezer
      }
    }

    await supabaseAdmin
      .from('cached_albums')
      .upsert(
        fresh.data.map(album => ({
          artist_deezer_id: artistId,
          album_deezer_id: album.id,
          album_data: album,
          cached_at: new Date().toISOString(),
          original_release_year: yearMap.get(album.id) ?? null,
          title: album.title,
          cover_xl: album.cover_xl,
          artist_name: artistName ?? '',
        })),
        { onConflict: 'album_deezer_id' }
      )
  }

  return NextResponse.json({
    data: (fresh.data ?? []).map(album => ({
      ...album,
      original_release_year: yearMap.get(album.id) ?? null,
    })),
  })
}
