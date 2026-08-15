'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { textStyles } from '@/components/ui/text-styles'
import MarqueeText from '@/components/ui/marquee-text'
import type { TopAlbum } from './TopAlbumsSection'

export default function AlbumsRanking() {
  const [albums, setAlbums] = useState<TopAlbum[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setLoading(false); return }

      const { data: rpcData } = await supabase
        .rpc('get_top_albums', { p_user_id: user.id, p_limit: null })

      type TopAlbumRow = {
        album_deezer_id: number
        album_rating: number
        rated_at: string
        track_avg: number | null
        has_any_track_rating: boolean
      }
      const rows = (rpcData ?? []) as TopAlbumRow[]

      if (rows.length === 0) { setLoading(false); return }

      const albumIds = rows.map(r => r.album_deezer_id)
      const { data: albumsData } = await supabase
        .from('cached_albums')
        .select('album_deezer_id, title, artist_name, cover_xl, album_data')
        .in('album_deezer_id', albumIds)

      const mapped: TopAlbum[] = rows.map((r, i) => {
        const album = (albumsData ?? []).find(a => a.album_deezer_id === r.album_deezer_id)
        const raw = album?.album_data as { title?: string; cover_xl?: string } | null
        return {
          rank: i + 1,
          albumDeezerId: r.album_deezer_id,
          title: album?.title ?? raw?.title ?? 'Album inconnu',
          artistName: album?.artist_name ?? '',
          coverXl: album?.cover_xl ?? raw?.cover_xl ?? '',
          albumRating: r.album_rating,
          trackAvg: r.track_avg,
          hasAnyTrackRating: r.has_any_track_rating,
          ratedAt: r.rated_at,
        }
      })

      setAlbums(mapped)
      setLoading(false)
    })
  }, [])

  return (
    <div className="flex flex-col h-full">
      <div className="p-5 pr-12 flex-shrink-0 border-b border-border">
        <h2 className={`${textStyles.sectionTitle} text-text-green`}>Tes albums préférés</h2>
        {!loading && (
          <p className={`${textStyles.caption} text-text-secondary mt-1`}>
            {albums.length} album{albums.length > 1 ? 's' : ''} noté{albums.length > 1 ? 's' : ''}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && (
          <p className={`${textStyles.body} text-text-secondary px-5 py-4`}>Chargement...</p>
        )}
        {!loading && albums.map(album => (
          <AlbumRankingRow key={album.albumDeezerId} album={album} />
        ))}
      </div>
    </div>
  )
}

function AlbumRankingRow({ album }: { album: TopAlbum }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3 hover:bg-bg-tertiary transition-colors border-b border-border last:border-0">
      <span className={`${textStyles.caption} text-text-disabled w-5 text-right flex-shrink-0`}>
        {album.rank}
      </span>
      <div className="relative w-10 h-10 flex-shrink-0 rounded overflow-hidden bg-bg-tertiary">
        {album.coverXl && (
          <Image
            src={album.coverXl}
            alt={album.title}
            fill
            sizes="40px"
            className="object-cover"
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <MarqueeText className={`${textStyles.caption} font-medium text-text-primary`} fromColor="from-bg-secondary">{album.title}</MarqueeText>
        <p className={`${textStyles.caption} text-text-secondary truncate`}>{album.artistName}</p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[10px] text-text-secondary">Note attrib.</span>
          <div className="flex items-center gap-1">
            <Star size={11} className="text-text-green fill-text-green" />
            <span className={`${textStyles.caption} font-semibold text-text-primary`}>
              {album.albumRating != null ? album.albumRating.toFixed(1).replace('.', ',') : '—'}
            </span>
          </div>
        </div>
        <div className="w-px h-7 bg-border flex-shrink-0" />
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[10px] text-text-secondary">Moy. tracks</span>
          <div className="flex items-center gap-1">
            <Star size={11} className="text-text-green fill-text-green" />
            <span className={`${textStyles.caption} font-semibold text-text-primary`}>
              {album.trackAvg !== null ? album.trackAvg.toFixed(1).replace('.', ',') : '—'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
