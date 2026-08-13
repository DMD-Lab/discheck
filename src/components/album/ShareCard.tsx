import { forwardRef } from 'react'
import { Star } from 'lucide-react'
import DischecLogo from '@/components/ui/DischecLogo'
import { textStyles } from '@/components/ui/text-styles'
import { RATING_COLORS } from '@/lib/rating-colors'
import type { DeezerAlbumResult } from '@/lib/deezer/types'

export interface DisplayTrack {
  title: string
  rating?: number
}

interface ShareCardProps {
  album: DeezerAlbumResult
  coverSrc: string | null
  artistName: string | undefined
  displayTracks: DisplayTrack[]
  showTrackRatings: boolean
  showAvgBadge: boolean
  releaseRating: number | undefined
  avgRating: number | null
  pseudo: string | null
}

function StatBadge({ label, value, colorHex }: { label: string; value: string; colorHex: string | undefined }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg bg-bg-secondary px-3 py-3 min-w-[130px]">
      <span className="flex items-center gap-2 text-lg font-bold text-white tracking-wide">
        <Star size={16} style={colorHex ? { color: colorHex, fill: colorHex } : undefined} className={!colorHex ? 'text-text-disabled' : ''} />
        {value}
      </span>
      <span className="text-xs text-text-secondary">{label}</span>
    </div>
  )
}

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(function ShareCard(
  { album, coverSrc, artistName, displayTracks, showTrackRatings, showAvgBadge, releaseRating, avgRating, pseudo },
  ref
) {
  const releaseYear = album.original_release_year ?? (album.release_date ? new Date(album.release_date).getFullYear() : undefined)

  return (
    <div ref={ref} className="w-[420px] bg-bg-primary border border-border rounded-lg p-5 flex flex-col items-center gap-4">
      {coverSrc && (
        // eslint-disable-next-line @next/next/no-img-element -- pre-resolved data url, avoids html-to-image's fetch cache
        <img src={coverSrc} alt={album.title} width={220} height={220} className="rounded-lg object-cover" />
      )}

      <div className="flex flex-col items-center text-center gap-0.5">
        <p className={`${textStyles.cardTitle} text-text-primary`}>{album.title}</p>
        {artistName && <p className={`${textStyles.body} text-text-secondary`}>{artistName}</p>}
        {releaseYear && <p className={`${textStyles.caption} text-text-disabled`}>{releaseYear}</p>}
      </div>

      <div className="flex gap-2 justify-center">
        <StatBadge
          label="Ma note"
          value={releaseRating ? `${releaseRating} / 5` : '—'}
          colorHex={releaseRating ? RATING_COLORS[releaseRating] : undefined}
        />
        {showAvgBadge && (
          <StatBadge
            label="Moyenne titres"
            value={avgRating !== null ? `${avgRating.toFixed(1).replace('.', ',')} / 5` : '—'}
            colorHex={avgRating !== null ? RATING_COLORS[Math.floor(avgRating)] : undefined}
          />
        )}
      </div>

      {displayTracks.length > 0 && (
        <div className="w-full flex flex-col border-t border-b border-border">
          {!showTrackRatings && (
            <p className={`${textStyles.overline} text-text-disabled text-center py-2 border-b border-white/5`}>
              Mes titres préférés
            </p>
          )}
          {displayTracks.map((track, i) => (
            <div
              key={`${i}-${track.title}`}
              className={`flex items-center gap-2 py-1.5 ${i < displayTracks.length - 1 ? 'border-b border-white/5' : ''}`}
            >
              <span className={`${textStyles.caption} text-text-disabled w-4 text-right flex-shrink-0`}>{i + 1}</span>
              <span className={`${textStyles.body} text-text-secondary truncate flex-1`}>{track.title}</span>
              {showTrackRatings && track.rating !== undefined && (
                <span className="flex items-center gap-1 text-xs font-semibold text-white flex-shrink-0">
                  <Star size={12} style={{ color: RATING_COLORS[track.rating], fill: RATING_COLORS[track.rating] }} />
                  {track.rating}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <div className={`flex flex-col items-center gap-2 ${displayTracks.length === 0 ? 'w-full border-t border-border pt-4' : ''}`}>
        {pseudo && <p className={`${textStyles.caption} text-text-green font-semibold`}>@{pseudo}</p>}
        <DischecLogo height={20} variant="muted" showText />
      </div>
    </div>
  )
})

export default ShareCard
