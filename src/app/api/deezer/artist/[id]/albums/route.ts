import { NextRequest, NextResponse } from 'next/server'
import { getArtist, getArtistDiscography } from '@/lib/deezer/api'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { searchArtistMbid, getArtistReleaseGroups, matchRelease } from '@/lib/musicbrainz/api'

async function resolveArtistName(artistId: number): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from('cached_artists')
    .select('artist_data')
    .eq('artist_deezer_id', artistId)
    .single()

  const cached = (data?.artist_data as { name?: string })?.name ?? null
  if (cached) return cached

  try {
    return (await getArtist(artistId)).name ?? null
  } catch {
    return null
  }
}

async function hasOrphanNames(artistId: number): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('cached_albums')
    .select('album_deezer_id')
    .eq('artist_deezer_id', artistId)
    .or('artist_name.is.null,artist_name.eq.')
    .limit(1)

  return !!data?.length
}

// repairs delisted albums
async function backfillOrphanNames(artistId: number, artistName: string | null) {
  if (!artistName) return

  await supabaseAdmin
    .from('cached_albums')
    .update({ artist_name: artistName })
    .eq('artist_deezer_id', artistId)
    .or('artist_name.is.null,artist_name.eq.')
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const artistId = Number(id)

  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  // today's cache
  const { data: cached } = await supabaseAdmin
    .from('cached_albums')
    .select('album_data, original_release_year, original_release_date, cached_at')
    .eq('artist_deezer_id', artistId)
    .gte('cached_at', today.toISOString())

  if (cached && cached.length > 0) {
    if (await hasOrphanNames(artistId)) {
      await backfillOrphanNames(artistId, await resolveArtistName(artistId))
    }
    return NextResponse.json({
      data: cached.map(r => ({
        ...r.album_data,
        original_release_year: r.original_release_year ?? null,
        original_release_date: r.original_release_date ?? null,
      })),
    })
  }

  const [fresh, artistName] = await Promise.all([
    getArtistDiscography(artistId),
    resolveArtistName(artistId),
  ])

  const yearMap = new Map<number, number | null>()
  const dateMap = new Map<number, string | null>()

  // exclude pre-release placeholders
  if (fresh.data) {
    const todayStr = today.toISOString().slice(0, 10)
    fresh.data = fresh.data.filter(album => album.release_date <= todayStr)
  }

  // dedupe by title, keep earliest
  if (fresh.data) {
    const seen = new Map<string, typeof fresh.data[0]>()
    fresh.data.forEach(album => {
      const key = `${album.record_type}::${album.title.toLowerCase().trim()}`
      const existing = seen.get(key)
      if (!existing || album.release_date < existing.release_date) {
        seen.set(key, album)
      }
    })
    fresh.data = Array.from(seen.values())
  }

  if (fresh.data?.length) {
    // preserve existing values
    const { data: existing } = await supabaseAdmin
      .from('cached_albums')
      .select('album_deezer_id, original_release_year, original_release_date, artist_name')
      .eq('artist_deezer_id', artistId)

    ;(existing ?? []).forEach(r => {
      yearMap.set(r.album_deezer_id, r.original_release_year)
      dateMap.set(r.album_deezer_id, r.original_release_date)
    })
    const existingArtistName = (existing ?? []).find(r => r.artist_name)?.artist_name ?? null

    // retry if year or date missing
    const albumsMissingData = fresh.data.filter(a => !yearMap.get(a.id) || !dateMap.get(a.id))
    if (albumsMissingData.length > 0 && artistName) {
      try {
        const mbid = await searchArtistMbid(artistName)
        if (mbid) {
          const releaseGroups = await getArtistReleaseGroups(mbid)
          albumsMissingData.forEach(album => {
            const release = matchRelease(album.title, album.record_type, releaseGroups)
            if (release) {
              yearMap.set(album.id, release.year)
              dateMap.set(album.id, release.date)
            }
          })
        }
      } catch {
        // MusicBrainz fallback
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
          original_release_date: dateMap.get(album.id) ?? null,
          title: album.title,
          cover_xl: album.cover_xl,
          artist_name: artistName ?? existingArtistName,
          genre_id: (album as unknown as { genre_id?: number }).genre_id ?? null,
          record_type: (album as unknown as { record_type?: string }).record_type ?? null,
        })),
        { onConflict: 'album_deezer_id' }
      )
  }

  if (await hasOrphanNames(artistId)) {
    await backfillOrphanNames(artistId, artistName)
  }

  return NextResponse.json({
    data: (fresh.data ?? []).map(album => ({
      ...album,
      original_release_year: yearMap.get(album.id) ?? null,
      original_release_date: dateMap.get(album.id) ?? null,
    })),
  })
}
