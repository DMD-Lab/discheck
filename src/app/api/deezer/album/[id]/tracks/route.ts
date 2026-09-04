import { NextRequest, NextResponse } from 'next/server'
import { getAlbumTracks } from '@/lib/deezer/api'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { DeezerTrackResult } from '@/lib/deezer/types'

function sortTracks(tracks: DeezerTrackResult[]): DeezerTrackResult[] {
  return [...tracks].sort((a, b) =>
    (a.disk_number - b.disk_number) || (a.track_position - b.track_position)
  )
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const albumId = Number(id)

  const { data: cached } = await supabaseAdmin
    .from('cached_tracks')
    .select('track_data')
    .eq('album_deezer_id', albumId)

  if (cached && cached.length > 0) {
    return NextResponse.json({ data: sortTracks(cached.map(r => r.track_data as DeezerTrackResult)) })
  }

  const fresh = await getAlbumTracks(albumId)

  if (fresh.data?.length) {
    fresh.data = sortTracks(fresh.data)
    await supabaseAdmin
      .from('cached_tracks')
      .insert(
        fresh.data.map(track => ({
          album_deezer_id: albumId,
          track_deezer_id: track.id,
          track_data: track,
        }))
      )
  }

  return NextResponse.json(fresh)
}
