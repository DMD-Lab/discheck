import { useState, useRef } from 'react'
import { Check, X } from 'lucide-react'
import { textStyles } from '@/components/ui/text-styles'

interface TrackRowProps {
  position: number
  title: string
  duration: number
  listened: boolean
  rating?: number
  onToggle: () => void
  onRate: (rating: number) => void
}

const RATING_COLORS: Record<number, string> = {
  1: '#ef4444',
  2: '#f97316',
  3: '#eab308',
  4: '#84cc16',
  5: '#22c55e',
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function TrackRow({ position, title, duration, listened, rating, onToggle, onRate }: TrackRowProps) {
  const [showRating, setShowRating] = useState(false)
  const [popoverUp, setPopoverUp] = useState(false)
  const rowRef = useRef<HTMLDivElement>(null)

  function openRating() {
    if (rowRef.current) {
      const rect = rowRef.current.getBoundingClientRect()
      setPopoverUp(window.innerHeight - rect.bottom < 90)
    }
    setShowRating(prev => !prev)
  }

  function handleRate(n: number) {
    onRate(n)
    setShowRating(false)
  }

  return (
    <div ref={rowRef} className="relative flex items-center gap-3 px-4 py-2.5 hover:bg-bg-tertiary transition-colors group">
      <button
        onClick={onToggle}
        className="flex-shrink-0 w-5 h-5 rounded-full border border-border flex items-center justify-center transition-colors hover:border-primary"
        style={listened ? { backgroundColor: 'var(--primary)', borderColor: 'var(--primary)' } : {}}
      >
        {listened && <Check size={10} strokeWidth={3} className="text-white" />}
      </button>

      <span className={`${textStyles.caption} text-text-disabled w-5 text-right flex-shrink-0`}>
        {position}
      </span>

      <span className={`flex-1 ${textStyles.body} truncate ${listened ? 'text-text-secondary' : 'text-text-primary'}`}>
        {title}
      </span>

      <span className={`${textStyles.caption} text-text-disabled flex-shrink-0`}>
        {formatDuration(duration)}
      </span>

      <div className="flex-shrink-0 w-12 h-6 flex justify-end items-center">
        {!rating && (
          <button
            onClick={openRating}
            className={`${textStyles.caption} text-text-disabled hover:text-text-secondary transition-colors border border-border rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100`}
          >
            Noter
          </button>
        )}
        {rating && (
          <button
            onClick={openRating}
            className={`${textStyles.caption} font-bold px-1.5 py-0.5 rounded`}
            style={{
              color: RATING_COLORS[rating],
              backgroundColor: `${RATING_COLORS[rating]}22`,
            }}
          >
            {rating}
          </button>
        )}
      </div>

      {showRating && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowRating(false)} />
          <div className={`absolute right-4 z-20 bg-bg-secondary border border-border rounded-lg p-2 shadow-lg ${popoverUp ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
            <div className="flex items-center justify-between mb-1.5">
              <p className={`${textStyles.caption} text-text-disabled`}>Noter ce titre</p>
              <button
                onClick={() => setShowRating(false)}
                className="text-text-disabled hover:text-text-primary transition-colors ml-3"
              >
                <X size={12} />
              </button>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => handleRate(n)}
                  className="w-7 h-7 rounded text-xs font-bold border transition-colors hover:opacity-80"
                  style={{
                    color: RATING_COLORS[n],
                    borderColor: rating === n ? RATING_COLORS[n] : 'var(--border)',
                    backgroundColor: rating === n ? `${RATING_COLORS[n]}22` : 'transparent',
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
