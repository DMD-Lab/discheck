'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { textStyles } from '@/components/ui/text-styles'
import MarqueeText from '@/components/ui/marquee-text'
import type { FavoriteTrack } from './RecapFavoritesSection'

export default function RecapTracksRanking({ start, end }: { start: string; end: string }) {
  const [tracks, setTracks] = useState<FavoriteTrack[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setLoading(false); return }

      const { data: rpcData } = await supabase
        .rpc('get_month_favorite_track', { p_user_id: user.id, p_start: start, p_end: end, p_limit: null })

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
        .select('album_deezer_id, artist_name, artist_deezer_id, cover_xl')
        .in('album_deezer_id', albumIds)

      const mapped: FavoriteTrack[] = ratings.map(r => {
        const track = (tracksData ?? []).find(t => t.track_deezer_id === r.track_deezer_id)
        const album = (albumsData ?? []).find(a => a.album_deezer_id === track?.album_deezer_id)
        const raw = track?.track_data as { title?: string } | null
        return {
          trackDeezerId: r.track_deezer_id,
          title: raw?.title ?? 'Track inconnue',
          artistName: album?.artist_name ?? '',
          artistDeezerId: album?.artist_deezer_id ?? 0,
          coverXl: album?.cover_xl ?? '',
        }
      })

      setTracks(mapped)
      setLoading(false)
    })
  }, [start, end])

  return (
    <div className="flex flex-col h-full">
      <div className="p-5 pr-12 flex-shrink-0 border-b border-border">
        <h2 className={`${textStyles.sectionTitle} text-text-green`}>Titres favoris</h2>
        {!loading && (
          <p className={`${textStyles.caption} text-text-secondary mt-1`}>
            {tracks.length} titre{tracks.length > 1 ? 's' : ''} noté{tracks.length > 1 ? 's' : ''} 5/5
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
              <TrackPanelRow key={track.trackDeezerId} track={track} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function TrackPanelRow({ track }: { track: FavoriteTrack }) {
  return (
    <div className="flex items-center gap-3 px-4 py-1.5">
      <div className="relative w-9 h-9 flex-shrink-0">
        {track.coverXl ? (
          <Image src={track.coverXl} alt={track.title} fill sizes="36px" className="rounded object-cover" />
        ) : (
          <div className="w-full h-full rounded bg-bg-tertiary" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <MarqueeText className={`${textStyles.caption} font-medium text-text-primary`} fromColor="from-bg-secondary">
          {track.title}
        </MarqueeText>
        <p className={`${textStyles.caption} text-text-secondary truncate`}>{track.artistName}</p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <Star size={11} className="text-text-green fill-text-green" />
        <span className={`${textStyles.statSm} text-text-primary`}>5,0</span>
      </div>
    </div>
  )
}
