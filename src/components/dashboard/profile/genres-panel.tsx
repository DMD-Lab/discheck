import { textStyles } from "@/components/ui/text-styles"
import type { GenreStats } from "@/lib/insights/genre-insight"

export default function GenresPanelContent({ genres }: { genres: GenreStats[] }) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-5 pb-4 pr-14 flex-shrink-0 border-b border-border">
        <h2 className={`${textStyles.cardTitle} text-text-green`}>Tous les genres</h2>
        <p className={`${textStyles.caption} text-text-secondary mt-0.5`}>
          {genres.length} genre{genres.length > 1 ? "s" : ""} écouté{genres.length > 1 ? "s" : ""}
        </p>
      </div>
      <div className="flex-1 overflow-y-auto">
        {genres.map((genre, i) => (
          <div key={genre.genreId} className="flex items-center gap-3 px-5 py-3 border-b border-border last:border-0 hover:bg-bg-tertiary transition-colors">
            <span className={`${textStyles.caption} text-text-disabled w-4 text-right flex-shrink-0`}>{i + 1}</span>
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: genre.color }} />
            <span className={`${textStyles.body} font-medium text-text-primary flex-1`}>{genre.name}</span>
            <span className={`${textStyles.caption} font-semibold text-text-primary`}>{genre.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
