import Image from 'next/image'
import { textStyles } from "@/components/ui/text-styles"
import type { GenreStats } from "@/lib/insights/genre-insight"

export default function GenresPanelContent({ genres }: { genres: GenreStats[] }) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-5 pr-12 flex-shrink-0 border-b border-border">
        <h2 className={`${textStyles.sectionTitle} text-text-green`}>Tous les genres</h2>
        <p className={`${textStyles.caption} text-text-secondary mt-1`}>
          {genres.length} genre{genres.length > 1 ? "s" : ""} écouté{genres.length > 1 ? "s" : ""}
        </p>
      </div>
      <div className="flex-1 overflow-y-auto pt-4">
        {genres.map((genre, i) => (
          <div key={genre.genreId} className="flex items-center gap-3 px-5 py-3 border-b border-border last:border-0">
            <span className={`${textStyles.caption} text-text-disabled w-4 text-right flex-shrink-0`}>{i + 1}</span>
            <div
              className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"
              style={{ boxShadow: `0 4px 14px ${genre.color}70` }}
            >
              <Image
                src={`/genre/${genre.genreId}.png`}
                alt={genre.name}
                fill
                className="object-cover object-center"
                sizes="40px"
              />
              <div className="absolute inset-0" style={{ backgroundColor: `${genre.color}50` }} />
            </div>
            <span className={`${textStyles.body} font-medium text-text-primary flex-1`}>{genre.name}</span>
            <span className={`${textStyles.caption} font-semibold text-text-primary`}>{genre.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
