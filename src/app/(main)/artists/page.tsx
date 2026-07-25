'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Link, useTransitionRouter } from 'next-view-transitions'
import { ChevronRight, Search, Star } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button-variants'
import { textStyles } from '@/components/ui/text-styles'
import { createClient } from '@/lib/supabase/client'
import type { DeezerArtistResult } from '@/lib/deezer/types'
import { useFavorites } from '@/context/FavoritesContext'

interface ArtistProgress {
  listened: number
  total: number
}

export default function ArtistsPage() {
  const router = useTransitionRouter()
  const [artists, setArtists] = useState<DeezerArtistResult[]>([])
  const [progressMap, setProgressMap] = useState<Map<number, ArtistProgress>>(new Map())
  const [artistDbIdMap, setArtistDbIdMap] = useState<Map<number, number>>(new Map())
  const [loading, setLoading] = useState(true)
  const { favoriteIds, toggleFavorite } = useFavorites()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return

      const { data: rpcData } = await supabase
        .rpc('get_listened_artists', { p_user_id: user.id })
      type RpcRow = { artist_deezer_id: number; artist_data: DeezerArtistResult }
      const rpcRows = (rpcData ?? []) as RpcRow[]
      const fetchedArtists = rpcRows
        .map(r => r.artist_data)
        .sort((a, b) => a.name.trim().localeCompare(b.name.trim()))
      setArtists(fetchedArtists)
      setArtistDbIdMap(new Map(rpcRows.map(r => [r.artist_data.id, r.artist_deezer_id])))
      setLoading(false)

      if (fetchedArtists.length === 0) return

      const { data: progressData } = await supabase
        .rpc('get_artist_progress', { p_user_id: user.id })

      type ProgressRow = { artist_deezer_id: number; total_albums: number; listened_albums: number }
      const map = new Map<number, ArtistProgress>()
      ;(progressData ?? [] as ProgressRow[]).forEach((row: ProgressRow) => {
        map.set(row.artist_deezer_id, { total: row.total_albums, listened: row.listened_albums })
      })

      setProgressMap(map)
    })
  }, [])


  return (
    <>
      <div className="fixed top-0 right-0 bottom-0 left-0 md:left-56 -z-10 overflow-hidden">
        <Image src="/artists-bg.png" alt="" fill sizes="100vw" className="object-cover object-center" loading="eager" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, var(--bg-primary) 5%, color-mix(in srgb, var(--bg-primary) 45%, transparent) 55%, color-mix(in srgb, var(--bg-primary) 5%, transparent) 100%)',
          }}
        />
      </div>

      <div className="max-w-5xl mx-auto w-full flex flex-col flex-1 px-4 py-6 md:px-8 lg:px-16 lg:py-12">
        <div className="mb-10">
          <div className="flex items-baseline justify-between gap-3 mb-1.5">
            <div className="flex items-baseline gap-3">
              <h1 className={`${textStyles.pageTitle} text-text-green`}>Mes artistes</h1>
              {!loading && artists.length > 0 && (
                <span className={`${textStyles.caption} text-text-disabled`}>
                  {artists.length} artiste{artists.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            {!loading && (
              <span className={`${textStyles.caption} flex items-center gap-1 flex-shrink-0 ${
                favoriteIds.size >= 10 ? 'text-primary' : 'text-text-disabled'
              }`}>
                <Star size={11} fill={favoriteIds.size > 0 ? 'currentColor' : 'none'} />
                {favoriteIds.size}/10 favoris
              </span>
            )}
          </div>
          <p className={`${textStyles.body} text-text-secondary`}>
            Les artistes s&apos;ajoutent automatiquement lorsque vous écoutez un album ou un single.
          </p>
        </div>

        {loading && (
          <div className="flex flex-col gap-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center px-4 py-3 gap-3">
                <div className="w-10 h-10 rounded-full bg-bg-tertiary animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-36 bg-bg-tertiary rounded animate-pulse" />
                  <div className="h-3 w-20 bg-bg-tertiary rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && artists.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6">
            <div className="text-center">
              <h1 className={`${textStyles.pageTitle} text-text-green mb-2`}>Aucun artiste pour l&apos;instant</h1>
              <p className={`${textStyles.body} text-text-secondary mb-6 mx-auto max-w-sm`}>
                Commencez à écouter des albums ou des singles pour les voir apparaître ici.
              </p>
              <Link href="/search" className={buttonVariants({ variant: 'primary', size: 'md' })}>
                <Search size={14} />
                Aller à la recherche
              </Link>
            </div>
          </div>
        )}

        {!loading && artists.length > 0 && (
          <div className="flex flex-col">
            <div className="flex items-center px-4 pb-2 border-b border-border mb-1">
              <div className={`flex-1 ${textStyles.overline} text-text-disabled`}>Artiste</div>
              <div className={`hidden md:block w-36 ${textStyles.overline} text-text-disabled`}>Progression</div>
              <div className={`hidden md:block w-24 ${textStyles.overline} text-text-disabled text-right`}>Écoutés</div>
              <div className="hidden md:block w-8" />
            </div>

            {artists.map(artist => {
              const progress = progressMap.get(artistDbIdMap.get(artist.id) ?? artist.id)
              const pct = progress && progress.total > 0
                ? (progress.listened > 0 ? Math.max(1, Math.round((progress.listened / progress.total) * 100)) : 0)
                : null

              return (
                <div
                  key={artist.id}
                  className="flex items-center px-4 py-3 rounded-lg hover:bg-bg-secondary/60 backdrop-blur-sm transition-colors w-full group cursor-pointer border-b border-border"
                  onClick={() => router.push(`/artist/${artist.id}`)}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(artist) }}
                    className={`w-7 h-7 flex items-center justify-center rounded-md flex-shrink-0 transition-colors mr-1 ${
                      favoriteIds.has(artist.id)
                        ? 'text-primary'
                        : 'text-text-disabled hover:text-text-secondary'
                    } ${!favoriteIds.has(artist.id) && favoriteIds.size >= 10 ? 'opacity-30 cursor-not-allowed' : ''}`}
                    title={favoriteIds.has(artist.id) ? 'Retirer des favoris' : favoriteIds.size >= 10 ? '10 favoris maximum' : 'Ajouter aux favoris'}
                  >
                    <Star size={14} fill={favoriteIds.has(artist.id) ? 'currentColor' : 'none'} />
                  </button>

                  <div className="flex-1 flex items-center gap-3 min-w-0">
                    <Image
                      src={artist.picture_medium}
                      alt={artist.name}
                      width={40}
                      height={40}
                      className="rounded-full object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className={`${textStyles.body} font-medium text-text-primary truncate`}>{artist.name}</p>
                      {progress?.total != null && (
                        <p className={`${textStyles.caption} text-text-secondary whitespace-nowrap`}>{progress.total} sortie{progress.total > 1 ? 's' : ''}</p>
                      )}
                    </div>
                  </div>

                  <div className="hidden md:flex w-36 flex-shrink-0">
                    {pct !== null ? (
                      <div className="flex items-center gap-2 w-full">
                        <div className="flex-1 h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: 'var(--primary)',
                            }}
                          />
                        </div>
                        <span className={`${textStyles.caption} text-text-secondary w-8 text-right flex-shrink-0`}>
                          {pct}%
                        </span>
                      </div>
                    ) : (
                      <div className="h-1.5 bg-bg-tertiary/40 rounded-full w-full" />
                    )}
                  </div>

                  <div className={`hidden md:block w-24 ${textStyles.body} text-text-secondary text-right flex-shrink-0`}>
                    {progress
                      ? `${progress.listened}/${progress.total}`
                      : `—`
                    }
                  </div>

                  <div className="w-6 flex justify-end flex-shrink-0">
                    <ChevronRight size={14} className="text-text-disabled group-hover:text-text-secondary transition-colors" />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
