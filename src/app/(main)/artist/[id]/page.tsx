'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { Music2, CheckCircle2, Activity, Search, X } from 'lucide-react'
import StatCard from '@/components/ui/StatCard'
import { textStyles } from '@/components/ui/text-styles'
import type { DeezerArtistResult, DeezerAlbumResult } from '@/lib/deezer/types'
import ReleaseRow from '@/components/artist/ReleaseRow'
import Panel from '@/components/ui/panel'
import AlbumDetail from '@/components/layout/album-detail'
import { createClient } from '@/lib/supabase/client'
import DischecLoader from '@/components/ui/DischecLoader'

type Filter = 'all' | 'album' | 'ep' | 'single'

export default function ArtistPage() {
  const { id } = useParams<{ id: string }>()
  const [artist, setArtist] = useState<DeezerArtistResult | null>(null)
  const [albums, setAlbums] = useState<DeezerAlbumResult[]>([])
  const [loading, setLoadingArtist] = useState(true)
  const [selectedAlbum, setSelectedAlbum] = useState<DeezerAlbumResult | null>(null)
  const [listenedIds, setListenedIds] = useState<Set<number>>(new Set())
  const [ratingMap, setRatingMap] = useState<Map<number, number>>(new Map())
  const [albumRatingMap, setAlbumRatingMap] = useState<Map<number, number>>(new Map())
  const [albumUserDateMap, setAlbumUserDateMap] = useState<Map<number, string>>(new Map())
  const [albumTracksMap, setAlbumTracksMap] = useState<Map<number, number[]>>(new Map())
  const [activeFilter, setActiveFilter] = useState<Filter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [listenedDateMap, setListenedDateMap] = useState<Map<number, { userDate: string | null; checkDate: string }>>(new Map())

  useEffect(() => {
    Promise.all([
      fetch(`/api/deezer/artist/${id}`).then(r => r.json()),
      fetch(`/api/deezer/artist/${id}/albums`).then(r => r.json()),
    ]).then(([artistData, albumsData]) => {
      const getYear = (a: DeezerAlbumResult) =>
        a.original_release_year ?? new Date(a.release_date).getFullYear()
      const sorted = (albumsData.data ?? []).sort(
        (a: DeezerAlbumResult, b: DeezerAlbumResult) => getYear(b) - getYear(a)
      )
      setArtist(artistData)
      setAlbums(sorted)
      setLoadingArtist(false)
    })
  }, [id])

  useEffect(() => {
    if (albums.length === 0) return
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      const albumIds = albums.map(a => a.id)
      Promise.all([
        supabase.from('listened_tracks').select('track_deezer_id, listened_at, listened_at_user').eq('user_id', user.id),
        supabase.from('track_ratings').select('track_deezer_id, rating').eq('user_id', user.id),
        supabase.from('album_ratings').select('album_deezer_id, rating, listened_at_user').eq('user_id', user.id).in('album_deezer_id', albumIds),
        supabase.from('cached_tracks').select('track_deezer_id, album_deezer_id').in('album_deezer_id', albumIds),
      ]).then(([listens, trackRatings, albumRatings, tracks]) => {
        if (listens.data) {
          setListenedIds(new Set(listens.data.map(r => r.track_deezer_id)))
          setListenedDateMap(new Map(listens.data.map(r => {
            const row = r as { track_deezer_id: number; listened_at: string; listened_at_user: string | null }
            return [row.track_deezer_id, { userDate: row.listened_at_user ?? null, checkDate: row.listened_at }]
          })))
        }
        if (trackRatings.data) setRatingMap(new Map(trackRatings.data.map(r => [r.track_deezer_id, r.rating])))
        if (albumRatings.data) {
          const rows = albumRatings.data as Array<{ album_deezer_id: number; rating: number | null; listened_at_user: string | null }>
          setAlbumRatingMap(new Map(rows.filter(r => r.rating != null).map(r => [r.album_deezer_id, r.rating!])))
          setAlbumUserDateMap(new Map(rows.filter(r => r.listened_at_user != null).map(r => [r.album_deezer_id, r.listened_at_user!])))
        }
        if (tracks.data) {
          const map = new Map<number, number[]>()
          tracks.data.forEach(r => {
            const list = map.get(r.album_deezer_id) ?? []
            list.push(r.track_deezer_id)
            map.set(r.album_deezer_id, list)
          })
          setAlbumTracksMap(map)
        }
      })
    })
  }, [albums])

  async function handleToggleTrack(trackId: number) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const isListened = listenedIds.has(trackId)
    if (isListened) {
      await supabase.from('listened_tracks').delete().eq('user_id', user.id).eq('track_deezer_id', trackId)
      setListenedIds(prev => { const next = new Set(prev); next.delete(trackId); return next })
      setListenedDateMap(prev => { const next = new Map(prev); next.delete(trackId); return next })
    } else {
      const now = new Date().toISOString()
      await supabase.from('listened_tracks').insert({ user_id: user.id, track_deezer_id: trackId, album_deezer_id: trackAlbumMap.get(trackId) ?? selectedAlbum?.id ?? null })
      setListenedIds(prev => new Set(prev).add(trackId))
      setListenedDateMap(prev => new Map(prev).set(trackId, { userDate: null, checkDate: now }))
    }
  }

  async function handleRateTrack(trackId: number, rating: number) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('track_ratings').upsert(
      { user_id: user.id, track_deezer_id: trackId, rating },
      { onConflict: 'user_id,track_deezer_id' }
    )
    setRatingMap(prev => new Map(prev).set(trackId, rating))
  }

  async function handleRateAlbum(albumId: number, rating: number) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('album_ratings').upsert(
      { user_id: user.id, album_deezer_id: albumId, rating },
      { onConflict: 'user_id,album_deezer_id' }
    )
    setAlbumRatingMap(prev => new Map(prev).set(albumId, rating))
  }

  const handleTracksLoaded = useCallback((albumId: number, trackIds: number[]) => {
    setAlbumTracksMap(prev => new Map(prev).set(albumId, trackIds))
  }, [])

  async function handleCheckAll(trackIds: number[]) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const unlistened = trackIds.filter(id => !listenedIds.has(id))
    if (unlistened.length === 0) return
    const now = new Date().toISOString()
    await supabase.from('listened_tracks').insert(
      unlistened.map(id => ({ user_id: user.id, track_deezer_id: id, album_deezer_id: trackAlbumMap.get(id) ?? selectedAlbum?.id ?? null }))
    )
    setListenedIds(prev => new Set([...prev, ...unlistened]))
    setListenedDateMap(prev => {
      const next = new Map(prev)
      unlistened.forEach(id => next.set(id, { userDate: null, checkDate: now }))
      return next
    })
  }

  async function handleUncheckAll(trackIds: number[]) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('listened_tracks')
      .delete()
      .eq('user_id', user.id)
      .in('track_deezer_id', trackIds)
    setListenedIds(prev => {
      const next = new Set(prev)
      trackIds.forEach(id => next.delete(id))
      return next
    })
    setListenedDateMap(prev => {
      const next = new Map(prev)
      trackIds.forEach(id => next.delete(id))
      return next
    })
  }

  async function handleSetTrackDate(trackId: number, date: string | null) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('listened_tracks')
      .update({ listened_at_user: date } as never)
      .eq('user_id', user.id)
      .eq('track_deezer_id', trackId)

    // fallback to album date
    if (date === null) {
      const albumId = [...albumTracksMap.entries()].find(([, ids]) => ids.includes(trackId))?.[0]
      const albumDate = albumId ? albumUserDateMap.get(albumId) : undefined
      if (albumDate) {
        await supabase.from('listened_tracks')
          .update({ listened_at: albumDate } as never)
          .eq('user_id', user.id)
          .eq('track_deezer_id', trackId)
        setListenedDateMap(prev => {
          const next = new Map(prev)
          const existing = next.get(trackId)
          if (existing) next.set(trackId, { ...existing, userDate: null, checkDate: albumDate })
          return next
        })
        return
      }
    }

    setListenedDateMap(prev => {
      const next = new Map(prev)
      const existing = next.get(trackId)
      if (existing) next.set(trackId, { ...existing, userDate: date })
      return next
    })
  }

  async function handleSetAlbumDate(albumId: number, date: string | null) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('album_ratings').upsert(
      { user_id: user.id, album_deezer_id: albumId, listened_at_user: date } as never,
      { onConflict: 'user_id,album_deezer_id' }
    )
    setAlbumUserDateMap(prev => {
      const next = new Map(prev)
      if (date) next.set(albumId, date)
      else next.delete(albumId)
      return next
    })

    // push date to unlocked tracks
    if (date) {
      const trackIds = albumTracksMap.get(albumId) ?? []
      const unprotected = trackIds.filter(id => listenedIds.has(id) && !listenedDateMap.get(id)?.userDate)
      if (unprotected.length > 0) {
        await supabase.from('listened_tracks')
          .update({ listened_at: date } as never)
          .eq('user_id', user.id)
          .in('track_deezer_id', unprotected)
        setListenedDateMap(prev => {
          const next = new Map(prev)
          unprotected.forEach(id => {
            const existing = next.get(id)
            if (existing) next.set(id, { ...existing, checkDate: date })
          })
          return next
        })
      }
    }
  }

  let terminées = 0
  let enCours = 0
  albums.forEach(album => {
    const tracks = albumTracksMap.get(album.id) ?? []
    const count = tracks.filter(tid => listenedIds.has(tid)).length
    if (tracks.length > 0) {
      if (count >= tracks.length) terminées++
      else if (count > 0) enCours++
    }
  })
  const stats = { terminées, enCours, pct: albums.length > 0 ? Math.round((terminées / albums.length) * 100) : 0 }

  const trackAlbumMap = new Map<number, number>()
  for (const [albumId, tracks] of albumTracksMap.entries()) {
    for (const trackId of tracks) trackAlbumMap.set(trackId, albumId)
  }

  const trackAvgMap = new Map<number, number>()
  albums.forEach(album => {
    const tracks = albumTracksMap.get(album.id)
    if (!tracks || tracks.length === 0) return
    if (!tracks.every(tid => listenedIds.has(tid))) return
    if (!tracks.every(tid => ratingMap.has(tid))) return
    const avg = tracks.reduce((sum, tid) => sum + (ratingMap.get(tid) ?? 0), 0) / tracks.length
    trackAvgMap.set(album.id, Math.round(avg * 10) / 10)
  })

  const filteredAlbums = albums
    .filter(a => activeFilter === 'all' || a.record_type === activeFilter)
    .filter(a => !searchQuery.trim() || a.title.toLowerCase().includes(searchQuery.toLowerCase()))

  const yearMap = new Map<string, DeezerAlbumResult[]>()
  filteredAlbums.forEach(album => {
    const year = String(album.original_release_year ?? album.release_date?.slice(0, 4) ?? '—')
    const list = yearMap.get(year) ?? []
    list.push(album)
    yearMap.set(year, list)
  })
  const groupedByYear = Array.from(yearMap.entries()).map(([year, releases]) => ({ year, releases }))

  if (loading) {
    return (
      <div className="relative">
      <div className="max-w-5xl mx-auto w-full px-4 py-6 md:px-8 lg:px-16 lg:py-12">
        <div className="flex items-start gap-4 md:gap-6 mb-4 md:mb-8">
          <div className="w-20 h-20 md:w-28 md:h-28 rounded-lg bg-bg-tertiary animate-pulse flex-shrink-0" />
          <div className="flex-1 pt-1 space-y-3">
            <div className="h-8 md:h-10 w-48 md:w-56 bg-bg-tertiary rounded-lg animate-pulse" />
            <div className="h-3.5 w-36 bg-bg-tertiary rounded animate-pulse" />
          </div>
          <div className="hidden lg:flex gap-3 mt-1">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-24 h-14 rounded-xl bg-bg-tertiary animate-pulse" />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-6 lg:hidden">
          {[0, 1, 2].map(i => (
            <div key={i} className="h-10 rounded-xl bg-bg-tertiary animate-pulse" />
          ))}
        </div>
        <div className="flex gap-2 mb-6">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="h-7 w-16 rounded-full bg-bg-tertiary animate-pulse" />
          ))}
        </div>
        <div className="relative">
          <div className="absolute top-0 bottom-0 w-px bg-bg-tertiary left-[44px] lg:left-[82px]" />
          <div className="flex flex-col gap-4">
            {[3, 2, 4, 2].map((count, gi) => (
              <div key={gi} className="flex items-start">
                <div className="flex-shrink-0 flex justify-end pt-4 w-8 lg:w-16">
                  <div className="h-3.5 w-10 bg-bg-tertiary rounded animate-pulse" />
                </div>
                <div className="flex-shrink-0 flex justify-center pt-4 w-6 lg:w-9">
                  <div className="w-2.5 h-2.5 rounded-full bg-bg-tertiary" />
                </div>
                <div className="flex-1 flex flex-col">
                  {Array.from({ length: count }).map((_, ri) => (
                    <div key={ri} className="flex items-center gap-4 px-3 py-3">
                      <div className="w-10 h-10 rounded bg-bg-tertiary animate-pulse flex-shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3.5 bg-bg-tertiary rounded animate-pulse" style={{ width: `${50 + (ri * 17) % 35}%` }} />
                      </div>
                      <div className="h-5 w-12 rounded-full bg-bg-tertiary animate-pulse" />
                      <div className="h-3 w-8 bg-bg-tertiary rounded animate-pulse" />
                      <div className="w-6 h-6 rounded-full bg-bg-tertiary animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/60 backdrop-blur-[2px] pointer-events-none">
        <DischecLoader size={80} />
      </div>
      </div>
    )
  }

  if (!artist) {
    return <div className="max-w-5xl mx-auto w-full px-4 py-6 md:px-8 lg:px-16 lg:py-12"><p className="text-text-secondary text-sm">Artiste introuvable.</p></div>
  }

  return (
    <div className="max-w-5xl mx-auto w-full px-4 py-6 md:px-8 lg:px-16 lg:py-12">
      <div className="flex items-start gap-4 md:gap-6 mb-4 md:mb-8">
        <Image
          src={artist.picture_xl}
          alt={artist.name}
          width={112}
          height={112}
          className="rounded-lg object-cover flex-shrink-0 w-20 h-20 md:w-28 md:h-28"
          loading="eager"
        />
        <div className="flex-1 min-w-0 pt-1">
          <h1 className={`${textStyles.display} text-text-primary`}>{artist.name}</h1>
          <p className={`${textStyles.body} text-text-secondary mt-2`}>
            {albums.length} sortie{albums.length > 1 ? 's' : ''} · {stats.pct}% écouté
          </p>
        </div>
        <div className="hidden lg:grid grid-cols-3 gap-3 shrink-0 mt-1">
          <StatCard icon={<Music2 size={16} className="text-text-secondary" />} value={albums.length} label="sorties" />
          <StatCard icon={<CheckCircle2 size={16} style={{ color: 'var(--primary)' }} />} value={stats.terminées} label="terminées" />
          <StatCard icon={<Activity size={16} style={{ color: 'var(--primary)' }} />} value={stats.enCours} label="en cours" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-6 lg:hidden">
        <StatCard compact icon={<Music2 size={14} className="text-text-secondary" />} value={albums.length} label="sorties" />
        <StatCard compact icon={<CheckCircle2 size={14} style={{ color: 'var(--primary)' }} />} value={stats.terminées} label="terminées" />
        <StatCard compact icon={<Activity size={14} style={{ color: 'var(--primary)' }} />} value={stats.enCours} label="en cours" />
      </div>

      <div className="flex items-center justify-between gap-3 mb-6 h-9">

        <div className={`flex gap-1 ${searchOpen ? 'hidden lg:flex' : 'flex'}`}>
          {(['all', 'album', 'ep', 'single'] as const).map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeFilter === f
                  ? 'bg-bg-tertiary text-text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {f === 'all' ? 'Tout' : f === 'album' ? 'Albums' : f === 'ep' ? 'EP' : 'Singles'}
            </button>
          ))}
        </div>

        <div className="relative hidden lg:block w-52 flex-shrink-0">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Rechercher..."
            className="w-full bg-bg-secondary border border-border rounded-lg pl-8 pr-7 py-1.5 text-text-primary text-sm outline-none focus:border-primary transition-colors placeholder:text-text-disabled"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-disabled hover:text-text-secondary transition-colors">
              <X size={12} />
            </button>
          )}
        </div>

        {!searchOpen && (
          <button onClick={() => setSearchOpen(true)} className="lg:hidden p-1 flex-shrink-0 text-text-secondary hover:text-text-primary transition-colors">
            <Search size={16} />
          </button>
        )}

        {searchOpen && (
          <div className="lg:hidden flex flex-1 min-w-0 items-center gap-2">
            <div className="relative flex-1 min-w-0">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Rechercher une sortie..."
                autoFocus
                onKeyDown={e => { if (e.key === 'Escape') { setSearchOpen(false); setSearchQuery('') } }}
                className="w-full bg-bg-secondary border border-border rounded-lg pl-8 pr-3 py-1.5 text-text-primary text-sm outline-none focus:border-primary transition-colors placeholder:text-text-disabled"
              />
            </div>
            <button
              onClick={() => { setSearchOpen(false); setSearchQuery('') }}
              className="flex-shrink-0 text-text-disabled hover:text-text-secondary transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}

      </div>

      {groupedByYear.length === 0 && (
        <p className={`${textStyles.body} text-text-secondary py-4`}>
          {searchQuery
            ? <>Aucune sortie pour &laquo;&nbsp;{searchQuery}&nbsp;&raquo;</>
            : 'Aucune sortie dans cette catégorie.'
          }
        </p>
      )}

      {groupedByYear.length > 0 && (
        <div className="relative">
          <div
            className="absolute top-0 bottom-0 w-px left-[44px] lg:left-[82px]"
            style={{ backgroundColor: 'var(--border-color)' }}
          />

          <div className="flex flex-col gap-4">
            {groupedByYear.map(({ year, releases }) => (
              <div key={year} className="flex items-start">
                <span
                  className={`flex-shrink-0 w-8 lg:w-16 ${textStyles.body} font-semibold text-text-disabled pt-3.5 text-right`}
                >
                  {year}
                </span>

                <div className="flex-shrink-0 flex justify-center pt-4 w-6 lg:w-9">
                  <div className="w-2.5 h-2.5 rounded-full border border-border bg-bg-primary relative z-10" />
                </div>

                <div className="flex-1 min-w-0 flex flex-col">
                  {releases.map((album, i) => (
                    <ReleaseRow
                      key={album.id}
                      album={album}
                      total={albumTracksMap.get(album.id)?.length}
                      listenedCount={
                        albumTracksMap.has(album.id)
                          ? (albumTracksMap.get(album.id) ?? []).filter(tid => listenedIds.has(tid)).length
                          : undefined
                      }
                      rating={albumRatingMap.get(album.id) ?? trackAvgMap.get(album.id)}
                      onClick={() => setSelectedAlbum(album)}
                      showDivider={i < releases.length - 1}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Panel isOpen={!!selectedAlbum} onClose={() => setSelectedAlbum(null)}>
        {selectedAlbum && (
          <AlbumDetail
            album={selectedAlbum}
            artistName={artist.name}
            listenedIds={listenedIds}
            ratingMap={ratingMap}
            albumRating={albumRatingMap.get(selectedAlbum.id)}
            albumListenedAtUser={albumUserDateMap.get(selectedAlbum.id) ?? null}
            listenedDateMap={listenedDateMap}
            onToggleTrack={handleToggleTrack}
            onRateTrack={handleRateTrack}
            onRateAlbum={(rating) => handleRateAlbum(selectedAlbum.id, rating)}
            onTracksLoaded={handleTracksLoaded}
            onCheckAll={handleCheckAll}
            onUncheckAll={handleUncheckAll}
            onSetTrackDate={handleSetTrackDate}
            onSetAlbumDate={(date) => handleSetAlbumDate(selectedAlbum.id, date)}
          />
        )}
      </Panel>
    </div>
  )
}
