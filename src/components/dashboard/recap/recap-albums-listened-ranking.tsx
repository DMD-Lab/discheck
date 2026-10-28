'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { textStyles } from '@/components/ui/text-styles'
import MarqueeText from '@/components/ui/marquee-text'
import { formatListenedDate } from './RecapListenedSection'
import type { ListenedAlbum } from './RecapListenedSection'

export default function RecapAlbumsListenedRanking({ start, end }: { start: string; end: string }) {
  const [albums, setAlbums] = useState<ListenedAlbum[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setLoading(false); return }

      const { data: rpcData } = await supabase
        .rpc('get_month_listened_albums', { p_user_id: user.id, p_start: start, p_end: end, p_limit: null })

      type ListenedAlbumRow = {
        album_deezer_id: number
        last_listened_at: string
        album_rating: number | null
        track_avg: number | null
        has_any_track_rating: boolean
      }
      const rows = (rpcData ?? []) as ListenedAlbumRow[]

      if (rows.length === 0) { setLoading(false); return }

      const albumIds = rows.map(r => r.album_deezer_id)
      const { data: albumsData } = await supabase
        .from('cached_albums')
        .select('album_deezer_id, title, artist_name, artist_deezer_id, cover_xl, record_type')
        .in('album_deezer_id', albumIds)

      const mapped: ListenedAlbum[] = rows.map(r => {
        const album = (albumsData ?? []).find(a => a.album_deezer_id === r.album_deezer_id)
        return {
          albumDeezerId: r.album_deezer_id,
          title: album?.title ?? 'Album inconnu',
          artistName: album?.artist_name ?? '',
          artistDeezerId: album?.artist_deezer_id ?? 0,
          coverXl: album?.cover_xl ?? '',
          recordType: album?.record_type ?? 'album',
          albumRating: r.album_rating,
          trackAvg: r.track_avg,
          lastListenedAt: r.last_listened_at,
        }
      })

      setAlbums(mapped)
      setLoading(false)
    })
  }, [start, end])

  return (
    <div className="flex flex-col h-full">
      <div className="p-5 pr-12 flex-shrink-0 border-b border-border">
        <h2 className={`${textStyles.sectionTitle} text-text-green`}>Albums &amp; EP écoutés</h2>
        {!loading && (
          <p className={`${textStyles.caption} text-text-secondary mt-1`}>
            {albums.length} album{albums.length > 1 ? 's' : ''}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && (
          <p className={`${textStyles.body} text-text-secondary px-5 py-4`}>Chargement...</p>
        )}
        {!loading && albums.map(album => (
          <AlbumPanelRow key={album.albumDeezerId} album={album} />
        ))}
      </div>
    </div>
  )
}

function AlbumPanelRow({ album }: { album: ListenedAlbum }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3 border-b border-border last:border-0">
      <div className="relative w-10 h-10 flex-shrink-0 rounded overflow-hidden bg-bg-tertiary">
        {album.coverXl && (
          <Image src={album.coverXl} alt={album.title} fill sizes="40px" className="object-cover" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <MarqueeText className={`${textStyles.caption} font-medium text-text-primary`} fromColor="from-bg-secondary">
          {album.title}
        </MarqueeText>
        <p className={`${textStyles.caption} text-text-secondary truncate`}>{album.artistName}</p>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[10px] text-text-secondary">Note album</span>
            <div className="flex items-center gap-1">
              <Star size={11} className="text-text-green fill-text-green" />
              <span className={`${textStyles.caption} font-semibold text-text-primary`}>
                {album.albumRating !== null ? album.albumRating.toFixed(1).replace('.', ',') : '—'}
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
        <span className="text-[10px] text-text-disabled">{formatListenedDate(album.lastListenedAt)}</span>
      </div>
    </div>
  )
}
