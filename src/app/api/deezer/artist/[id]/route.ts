import { NextRequest } from 'next/server'
import { getArtist } from '@/lib/deezer/api'
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
    .from('cached_artists')
    .select('artist_data')
    .eq('artist_deezer_id', artistId)
    .gte('cached_at', today.toISOString())
    .maybeSingle()

  if (cached) return Response.json(cached.artist_data)

  try {
    const data = await getArtist(artistId)

    await supabaseAdmin
      .from('cached_artists')
      .upsert(
        { artist_deezer_id: artistId, artist_data: data, cached_at: new Date().toISOString() },
        { onConflict: 'artist_deezer_id' }
      )

    return Response.json(data)
  } catch {
    return Response.json({ error: 'Artist not found' }, { status: 404 })
  }
}
