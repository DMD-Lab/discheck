'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { textStyles } from '@/components/ui/text-styles'
import MarqueeText from '@/components/ui/marquee-text'
import type { TopArtist } from './TopArtistesSection'

export default function ArtistsRanking() {
  const [artists, setArtists] = useState<TopArtist[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setLoading(false); return }

      const { data: trackRatings } = await supabase
        .from('track_ratings')
        .select('track_deezer_id, rating')
        .eq('user_id', user.id)

      if (!trackRatings || trackRatings.length === 0) { setLoading(false); return }

      const trackIds = trackRatings.map(r => r.track_deezer_id)
      const { data: tracksData } = await supabase
        .from('cached_tracks')
        .select('track_deezer_id, album_deezer_id')
        .in('track_deezer_id', trackIds)

      if (!tracksData || tracksData.length === 0) { setLoading(false); return }

      const albumIds = [...new Set(tracksData.map(t => t.album_deezer_id))]
      const { data: albumsData } = await supabase
        .from('cached_albums')
        .select('album_deezer_id, artist_deezer_id, artist_name')
        .in('album_deezer_id', albumIds)

      if (!albumsData || albumsData.length === 0) { setLoading(false); return }

      const artistIds = [...new Set(albumsData.map(a => a.artist_deezer_id).filter(Boolean))]
      const { data: artistsData } = await supabase
        .from('cached_artists')
        .select('artist_deezer_id, artist_data')
        .in('artist_deezer_id', artistIds)

      const artistMap = new Map<number, { totalRating: number; count: number; name: string; pictureXl: string }>()

      for (const tr of trackRatings) {
        const track = tracksData.find(t => t.track_deezer_id === tr.track_deezer_id)
        if (!track) continue
        const album = albumsData.find(a => a.album_deezer_id === track.album_deezer_id)
        if (!album?.artist_deezer_id) continue
        const artistId = album.artist_deezer_id

        if (!artistMap.has(artistId)) {
          const artist = (artistsData ?? []).find(a => a.artist_deezer_id === artistId)
          const raw = artist?.artist_data as { name?: string; picture_xl?: string } | null
          artistMap.set(artistId, {
            name: album.artist_name ?? raw?.name ?? '',
            pictureXl: raw?.picture_xl ?? '',
            totalRating: 0,
            count: 0,
          })
        }
        const entry = artistMap.get(artistId)!
        entry.totalRating += tr.rating
        entry.count += 1
      }

      const sorted: TopArtist[] = [...artistMap.entries()]
        .map(([artistId, data]) => ({
          rank: 0,
          artistDeezerId: artistId,
          name: data.name,
          pictureXl: data.pictureXl,
          avgRating: Math.round((data.totalRating / data.count) * 100) / 100,
          tracksRated: data.count,
        }))
        .filter((a) => a.tracksRated >= 5)
        .sort((a, b) => {
          if (b.avgRating !== a.avgRating) return b.avgRating - a.avgRating
          return b.tracksRated - a.tracksRated
        })
        .map((a, i) => ({ ...a, rank: i + 1 }))

      setArtists(sorted)
      setLoading(false)
    })
  }, [])

  return (
    <div className="flex flex-col h-full">
      <div className="p-5 pr-12 flex-shrink-0 border-b border-border">
        <h2 className={`${textStyles.sectionTitle} text-text-green`}>Top Artistes</h2>
        {!loading && (
          <p className={`${textStyles.caption} text-text-secondary mt-1`}>
            {artists.length} artiste{artists.length > 1 ? 's' : ''} noté{artists.length > 1 ? 's' : ''}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && (
          <p className={`${textStyles.body} text-text-secondary px-5 py-4`}>Chargement...</p>
        )}
        {!loading && artists.map(artist => (
          <ArtistRankingRow key={artist.artistDeezerId} artist={artist} />
        ))}
      </div>
    </div>
  )
}

function ArtistRankingRow({ artist }: { artist: TopArtist }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3 hover:bg-bg-tertiary transition-colors border-b border-border last:border-0">
      <span className={`${textStyles.caption} text-text-disabled w-5 text-right flex-shrink-0`}>
        {artist.rank}
      </span>
      <div className="relative w-10 h-10 flex-shrink-0">
        {artist.pictureXl ? (
          <Image
            src={artist.pictureXl}
            alt={artist.name}
            fill
            sizes="40px"
            className="rounded-full object-cover"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-bg-tertiary" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <MarqueeText
          className={`${textStyles.caption} font-medium text-text-primary`}
          fromColor="from-bg-secondary"
        >
          {artist.name}
        </MarqueeText>
        <p className={`${textStyles.caption} text-text-secondary`}>
          {artist.tracksRated} tracks notés
        </p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[10px] text-text-secondary">Moy. tracks</span>
          <div className="flex items-center gap-1">
            <Star size={11} className="text-text-green fill-text-green" />
            <span className={`${textStyles.caption} font-semibold text-text-primary`}>
              {artist.avgRating.toFixed(1).replace('.', ',')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
