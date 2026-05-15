'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { DeezerArtistResult } from '@/lib/deezer/types'

interface FavoritesContextValue {
  favorites: DeezerArtistResult[]
  favoriteIds: Set<number>
  toggleFavorite: (artist: DeezerArtistResult) => Promise<void>
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null)

export function FavoritesProvider({ userId, children }: { userId: string; children: ReactNode }) {
  const [favorites, setFavorites] = useState<DeezerArtistResult[]>([])
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('favorite_artists')
      .select('artist_deezer_id, cached_artists(artist_data)')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(5)
      .then(({ data }) => {
        if (!data) return
        const artists = data
          .map((r: { cached_artists: { artist_data: DeezerArtistResult }[] }) => r.cached_artists?.[0]?.artist_data)
          .filter(Boolean) as DeezerArtistResult[]
        setFavorites(artists)
        setFavoriteIds(new Set(artists.map(a => a.id)))
      })
  }, [userId])

  const toggleFavorite = useCallback(async (artist: DeezerArtistResult) => {
    const supabase = createClient()

    if (favoriteIds.has(artist.id)) {
      await supabase.from('favorite_artists').delete()
        .eq('user_id', userId).eq('artist_deezer_id', artist.id)
      setFavorites(prev => prev.filter(a => a.id !== artist.id))
      setFavoriteIds(prev => { const next = new Set(prev); next.delete(artist.id); return next })
    } else {
      if (favoriteIds.size >= 5) return
      await supabase.from('favorite_artists').insert({ user_id: userId, artist_deezer_id: artist.id })
      setFavorites(prev => [...prev, artist])
      setFavoriteIds(prev => new Set(prev).add(artist.id))
    }
  }, [userId, favoriteIds])

  return (
    <FavoritesContext.Provider value={{ favorites, favoriteIds, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites must be used inside FavoritesProvider')
  return ctx
}
