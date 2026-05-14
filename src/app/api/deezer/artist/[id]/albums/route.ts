import { NextRequest, NextResponse } from 'next/server'
import { getArtistDiscography } from '@/lib/deezer/api'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const artistId = Number(id)

  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  const { data: cached } = await supabaseAdmin
    .from('cached_albums')
    .select('album_data, cached_at')
    .eq('artist_deezer_id', artistId)
    .gte('cached_at', today.toISOString())

  if (cached && cached.length > 0) {
    return NextResponse.json({ data: cached.map(r => r.album_data) })
  }

  const fresh = await getArtistDiscography(artistId)

  if (fresh.data?.length) {
    await supabaseAdmin
      .from('cached_albums')
      .delete()
      .eq('artist_deezer_id', artistId)

    await supabaseAdmin
      .from('cached_albums')
      .insert(
        fresh.data.map(album => ({
          artist_deezer_id: artistId,
          album_deezer_id: album.id,
          album_data: album,
        }))
      )
  }

  return NextResponse.json(fresh)
}
