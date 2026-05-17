'use client'

import { useState, useEffect } from 'react'
import { Link, useTransitionRouter } from 'next-view-transitions'
import { Search, X, Music2 } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button-variants'
import { textStyles } from '@/components/ui/text-styles'
import Image from 'next/image'
import type { DeezerArtistResult } from '@/lib/deezer/types'

export default function SearchPage() {
  const router = useTransitionRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<DeezerArtistResult[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query.trim()) return

    const timeout = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/deezer/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults(data.data ?? [])
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 350)

    return () => clearTimeout(timeout)
  }, [query])

  const hasQuery = query.trim().length > 0
  const visibleResults = hasQuery ? results : []

  return (
    <>
      {/* Fond fixe — hors du flux, couvre tout l'espace main */}
      <div className="fixed top-0 right-0 bottom-0 left-0 md:left-56 -z-10 overflow-hidden">
        <Image
          src="/vinyl-bg.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center"
          loading="eager"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, var(--bg-primary) 5%, color-mix(in srgb, var(--bg-primary) 45%, transparent) 55%, color-mix(in srgb, var(--bg-primary) 5%, transparent) 100%)',
          }}
        />
      </div>

      {/* Contenu — hérite du max-w du layout */}
      <div className="flex flex-col flex-1 px-4 py-6 md:px-8 lg:px-16 lg:py-12">

        {/* Search bar */}
        <div className="relative w-full">
          <Search
            size={17}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none z-10"
          />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Rechercher un artiste..."
            autoFocus
            className="w-full bg-bg-secondary/80 backdrop-blur-sm border border-border rounded-lg pl-10 pr-9 py-3 text-text-primary text-sm outline-none focus:border-primary transition-colors placeholder:text-text-disabled"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-disabled hover:text-text-secondary transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Empty state */}
        {!hasQuery && (
          <div className="flex-1 flex flex-col justify-center">
            <h1 className={`${textStyles.display} text-text-green mb-4`}>
              Trouvez votre<br />prochaine<br />discographie
            </h1>
            <p className={`${textStyles.body} text-text-secondary leading-relaxed mb-10`}>
              Recherchez un artiste et explorez sa discographie complète.
              <br />Les résultats s&apos;affichent au fil de la saisie.
            </p>
            <div className="flex gap-2 flex-wrap">
              <Link
                href="/artists"
                className={buttonVariants({ variant: 'outline', size: 'md', className: 'backdrop-blur-sm bg-bg-secondary/60' })}
              >
                <Music2 size={12} />
                Mes artistes
              </Link>
            </div>
          </div>
        )}

        {/* Results */}
        {hasQuery && (
          <div className="mt-4 w-full">
            {loading && (
              <p className={`${textStyles.body} text-text-secondary mt-1`}>Recherche...</p>
            )}

            {!loading && visibleResults.length > 0 && (
              <>
                <p className={`${textStyles.caption} text-text-disabled mb-3`}>
                  {visibleResults.length} résultat{visibleResults.length > 1 ? 's' : ''} pour &laquo;&nbsp;{query.trim()}&nbsp;&raquo;
                </p>
                <div className="flex flex-col bg-bg-secondary/80 backdrop-blur-sm border border-border rounded-lg overflow-hidden">
                  {visibleResults.map((artist, i) => (
                    <button
                      key={artist.id}
                      onClick={() => router.push(`/artist/${artist.id}`)}
                      className={`flex items-center gap-3 px-4 py-3 hover:bg-bg-tertiary transition-colors text-left w-full ${i < visibleResults.length - 1 ? 'border-b border-border' : ''}`}
                    >
                      <Image
                        src={artist.picture_medium}
                        alt={artist.name}
                        width={40}
                        height={40}
                        className="rounded-full object-cover flex-shrink-0"
                      />
                      <div>
                        <p className={`${textStyles.body} font-medium text-text-primary`}>{artist.name}</p>
                        <p className={`${textStyles.caption} text-text-secondary`}>{artist.nb_album} sorties</p>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {!loading && query.trim() && results.length === 0 && (
              <p className={`${textStyles.body} text-text-secondary mt-1`}>
                Aucun résultat pour « {query} »
              </p>
            )}
          </div>
        )}
      </div>
    </>
  )
}
