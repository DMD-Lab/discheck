import { NextRequest } from 'next/server'
import { getArtist } from '@/lib/deezer/api'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const artistId = Number(id)

  try {
    const data = await getArtist(artistId)

    supabaseAdmin
      .from('cached_artists')
      .upsert({ artist_deezer_id: artistId, artist_data: data }, { onConflict: 'artist_deezer_id' })
      .then()

    return Response.json(data)
  } catch {
    return Response.json({ error: 'Artist not found' }, { status: 404 })
  }
}
