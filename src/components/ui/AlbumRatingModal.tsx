import { X } from 'lucide-react'
import { textStyles } from '@/components/ui/text-styles'
import { RATING_COLORS } from '@/lib/rating-colors'

interface AlbumRatingModalProps {
  currentRating?: number
  onRate: (rating: number) => void
  onRemove?: () => void
  onSkip: () => void
}

export default function AlbumRatingModal({ currentRating, onRate, onRemove, onSkip }: AlbumRatingModalProps) {
  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
    >
      <div className="bg-bg-secondary border border-border rounded-lg p-2 shadow-lg">
        <div className="flex items-center justify-between mb-1.5">
          <p className={`${textStyles.caption} text-text-disabled`}>Noter cet album</p>
          <button
            onClick={onSkip}
            className="text-text-disabled hover:text-text-primary transition-colors ml-3"
          >
            <X size={12} />
          </button>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              onClick={() => onRate(n)}
              className="w-7 h-7 rounded text-xs font-bold border transition-colors hover:opacity-80"
              style={{
                color: RATING_COLORS[n],
                borderColor: currentRating === n ? RATING_COLORS[n] : 'var(--border)',
                backgroundColor: currentRating === n ? `${RATING_COLORS[n]}22` : 'transparent',
              }}
            >
              {n}
            </button>
          ))}
        </div>
        {currentRating !== undefined && onRemove && (
          <div className="border-t border-border mt-2 pt-2">
            <button
              onClick={onRemove}
              className={`${textStyles.caption} text-left px-2 py-1 rounded hover:bg-bg-tertiary transition-colors text-text-secondary hover:text-text-primary w-full`}
            >
              Retirer la note
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
