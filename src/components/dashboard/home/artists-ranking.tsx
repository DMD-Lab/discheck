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

      const { data: rpcData } = await supabase
        .rpc('get_top_artists', { p_user_id: user.id, p_limit: 100 })

      type TopArtistRow = { artist_deezer_id: number; tracks_rated: number; avg_rating: number }
      const rows = (rpcData ?? []) as TopArtistRow[]

      if (rows.length === 0) { setLoading(false); return }

      const artistIds = rows.map(r => r.artist_deezer_id)
      const { data: artistsData } = await supabase
        .from('cached_artists')
        .select('artist_deezer_id, artist_data')
        .in('artist_deezer_id', artistIds)

      const mapped: TopArtist[] = rows.map((r, i) => {
        const artist = (artistsData ?? []).find(a => a.artist_deezer_id === r.artist_deezer_id)
        const raw = artist?.artist_data as { name?: string; picture_xl?: string } | null
        return {
          rank: i + 1,
          artistDeezerId: r.artist_deezer_id,
          name: raw?.name ?? '',
          pictureXl: raw?.picture_xl ?? '',
          avgRating: r.avg_rating,
          tracksRated: r.tracks_rated,
        }
      })

      setArtists(mapped)
      setLoading(false)
    })
  }, [])

  return (
    <div className="flex flex-col h-full">
      <div className="p-5 pr-12 flex-shrink-0 border-b border-border">
        <h2 className={`${textStyles.sectionTitle} text-text-green`}>Top Artistes</h2>
        {!loading && (
          <p className={`${textStyles.caption} text-text-secondary mt-1`}>
            {artists.length >= 100
              ? 'Top 100 artistes notés'
              : `${artists.length} artiste${artists.length > 1 ? 's' : ''} noté${artists.length > 1 ? 's' : ''}`}
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
