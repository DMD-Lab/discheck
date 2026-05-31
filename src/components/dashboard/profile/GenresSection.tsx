'use client'

import { useState } from "react"
import { ArrowRight, Music } from "lucide-react"
import { textStyles } from "@/components/ui/text-styles"
import { GenreCard, AutresCard } from "./GenreCard"
import type { GenreStats } from "@/lib/insights/genre-insight"
import Panel from "@/components/ui/panel"
import GenresPanelContent from "./genres-panel"

export default function GenresSection({
  genres,
  insight,
}: {
  genres: GenreStats[]
  insight: string
}) {
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  if (genres.length === 0) {
    return (
      <section>
        <div className="flex items-center pb-3 mb-3 gap-4">
          <h2 className={`${textStyles.cardTitle} text-text-green`}>Genres dominants</h2>
        </div>
        <div className="h-52 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-center p-6">
            <Music size={45} className="text-text-disabled w-7 h-7 md:w-[45px] md:h-[45px]" />
            <p className={`${textStyles.caption} text-text-secondary max-w-[200px]`}>
              Vos genres s&apos;afficheront ici après vos premières notes
            </p>
          </div>
        </div>
      </section>
    )
  }

  const displayed = genres.slice(0, 3)
  const othersCount = genres.length - 3
  const othersPercentage = genres.slice(3).reduce((sum, g) => sum + g.percentage, 0)

  return (
    <>
      <section>
        <div className="flex items-center justify-between pb-3 mb-3 gap-4">
          <div>
            <h2 className={`${textStyles.cardTitle} text-text-green`}>Genres dominants</h2>
            {insight && (
              <p className={`${textStyles.caption} text-text-secondary mt-1 max-w-xl`}>{insight}</p>
            )}
          </div>
          <button
            onClick={() => setIsPanelOpen(true)}
            className={`${textStyles.caption} text-text-primary hover:text-primary transition-colors flex items-center gap-1 flex-shrink-0 mt-0.5`}
          >
            Voir plus
            <ArrowRight size={12} />
          </button>
        </div>

        {/* mobile */}
        <div className="grid grid-cols-2 gap-4 lg:hidden">
          {displayed.map((genre, i) => (
            <div key={genre.genreId} className="aspect-square sm:aspect-[3/2]">
              <GenreCard genre={genre} priority={i === 0} rank={i + 1} />
            </div>
          ))}
          <div className="aspect-square sm:aspect-[3/2]">
            <AutresCard
              count={othersCount > 0 ? othersCount : 0}
              percentage={othersPercentage > 0 ? othersPercentage : 100 - displayed.reduce((s, g) => s + g.percentage, 0)}
              onClick={() => setIsPanelOpen(true)}
            />
          </div>
        </div>

        {/* desktop */}
        <div
          className="hidden lg:grid gap-4 h-52"
          style={{ gridTemplateColumns: '1fr 1fr 1fr 0.6fr' }}
        >
          {displayed.map((genre, i) => (
            <GenreCard key={genre.genreId} genre={genre} priority={i === 0} rank={i + 1} />
          ))}
          <AutresCard
            count={othersCount > 0 ? othersCount : 0}
            percentage={othersPercentage > 0 ? othersPercentage : 100 - displayed.reduce((s, g) => s + g.percentage, 0)}
            onClick={() => setIsPanelOpen(true)}
          />
        </div>
      </section>

      <Panel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)}>
        <GenresPanelContent genres={genres} />
      </Panel>
    </>
  )
}
