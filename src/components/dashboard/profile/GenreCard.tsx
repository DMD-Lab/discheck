import Image from "next/image"
import { LayoutGrid } from "lucide-react"
import { textStyles } from "@/components/ui/text-styles"
import type { GenreStats } from "@/lib/insights/genre-insight"

export type { GenreStats }

export function GenreCard({ genre, priority = false, rank }: { genre: GenreStats; priority?: boolean; rank?: number }) {
  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl">
      <Image
        src={`/genre/${genre.genreId}.png`}
        alt={genre.name}
        fill
        sizes="(min-width: 768px) 25vw, 50vw"
        className="object-cover object-center"
        priority={priority}
      />
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(to top, ${genre.color}99 0%, transparent 65%)` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      {rank !== undefined && (
        <span className="absolute top-2 left-2 text-xs font-bold text-text-primary bg-bg-primary/70 backdrop-blur-sm rounded w-6 h-6 flex items-center justify-center">
          {rank}
        </span>
      )}
      <div className="absolute inset-0 flex flex-col justify-end p-4 lg:p-8">
        <span className={`${textStyles.caption} text-white/75 leading-none`}>{genre.name}</span>
        <span className="text-white font-bold text-base sm:text-xl lg:text-2xl leading-none mt-2">{genre.percentage}%</span>
      </div>
    </div>
  )
}

export function AutresCard({
  count,
  percentage,
  onClick,
}: {
  count: number
  percentage: number
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="relative w-full h-full overflow-hidden rounded-xl bg-bg-tertiary flex flex-col items-center justify-center gap-2 sm:gap-5 hover:bg-bg-tertiary/80 transition-colors text-center"
    >
      <LayoutGrid size={45} className="text-text-secondary w-7 h-7 md:w-[45px] md:h-[45px]" />
      <div>
        <span className={`${textStyles.caption} text-text-secondary leading-none block`}>
          Autres genres
        </span>
        <span className={`${textStyles.caption} text-text-disabled leading-none block mt-1.5`}>
          {count} genre{count > 1 ? "s" : ""}
        </span>
        <span className="text-text-primary font-bold text-base sm:text-xl lg:text-2xl leading-none block mt-2">
          {percentage}%
        </span>
      </div>
    </button>
  )
}
