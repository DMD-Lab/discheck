'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { textStyles } from '@/components/ui/text-styles'
import TrackCard from './TrackCard'
import type { TopTrack } from './TracksFavoritesSection'

export default function TracksRanking() {
  const [tracks, setTracks] = useState<TopTrack[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setLoading(false); return }

      const { data: rpcData } = await supabase
        .rpc('get_favorite_tracks', { p_user_id: user.id, p_limit: 100 })

      type FavoriteTrackRow = { track_deezer_id: number; rated_at: string }
      const ratings = (rpcData ?? []) as FavoriteTrackRow[]

      if (ratings.length === 0) { setLoading(false); return }

      const trackIds = ratings.map(r => r.track_deezer_id)
      const { data: tracksData } = await supabase
        .from('cached_tracks')
        .select('track_deezer_id, album_deezer_id, track_data')
        .in('track_deezer_id', trackIds)

      const albumIds = [...new Set((tracksData ?? []).map(t => t.album_deezer_id))]
      const { data: albumsData } = await supabase
        .from('cached_albums')
        .select('album_deezer_id, artist_name, cover_xl')
        .in('album_deezer_id', albumIds)

      const mapped: TopTrack[] = ratings.map(r => {
        const track = (tracksData ?? []).find(t => t.track_deezer_id === r.track_deezer_id)
        const album = (albumsData ?? []).find(a => a.album_deezer_id === track?.album_deezer_id)
        const raw = track?.track_data as { title?: string } | null
        return {
          trackDeezerId: r.track_deezer_id,
          title: raw?.title ?? 'Track inconnue',
          artistName: album?.artist_name ?? '',
          coverXl: album?.cover_xl ?? '',
          ratedAt: r.rated_at,
        }
      })

      setTracks(mapped)
      setLoading(false)
    })
  }, [])

  return (
    <div className="flex flex-col h-full">
      <div className="p-5 pr-12 flex-shrink-0 border-b border-border">
        <h2 className={`${textStyles.sectionTitle} text-text-green`}>Tracks Favorites</h2>
        {!loading && (
          <p className={`${textStyles.caption} text-text-secondary mt-1`}>
            {tracks.length >= 100
              ? 'Top 100 tracks notées 5/5'
              : `${tracks.length} track${tracks.length > 1 ? 's' : ''} notée${tracks.length > 1 ? 's' : ''} 5/5`}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && (
          <p className={`${textStyles.body} text-text-secondary px-5 py-4`}>Chargement...</p>
        )}
        {!loading && (
          <div className="px-3 py-2 flex flex-col divide-y divide-border">
            {tracks.map(track => (
              <TrackCard key={track.trackDeezerId} track={track} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
