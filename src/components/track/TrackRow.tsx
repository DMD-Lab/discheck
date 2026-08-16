'use client'
import { useState, useRef, useEffect } from 'react'
import { Check, X, Calendar, Play, Pause } from 'lucide-react'
import { textStyles } from '@/components/ui/text-styles'
import MarqueeText from '@/components/ui/marquee-text'
import { RATING_COLORS } from '@/lib/rating-colors'
import DatePopover from '@/components/ui/date-popover'

// one active audio at a time
let _stopCurrent: (() => void) | null = null

function playPreview(url: string, onStop: () => void): () => void {
  if (_stopCurrent) _stopCurrent()
  const audio = new Audio(url)
  _stopCurrent = () => { audio.pause(); onStop() }
  audio.addEventListener('ended', () => { _stopCurrent = null; onStop() })
  audio.play().catch(() => onStop())
  return () => { audio.pause(); _stopCurrent = null; onStop() }
}

interface TrackRowProps {
  position: number
  title: string
  duration: number
  trackId: number
  hasPreview: boolean
  listened: boolean
  rating?: number
  listenedAt?: string
  listenedAtUser?: string | null
  releaseDate?: string
  onToggle: () => void
  onRate: (rating: number) => void
  onRemoveRating?: () => void
  onSetDate?: (date: string | null) => void
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatDateShort(iso: string): string {
  const d = iso.slice(0, 10).split('-')
  return `${d[2]}/${d[1]}/${d[0].slice(2)}`
}

export default function TrackRow({ position, title, duration, trackId, hasPreview, listened, rating, listenedAt, listenedAtUser, releaseDate, onToggle, onRate, onRemoveRating, onSetDate }: TrackRowProps) {
  const [showRating, setShowRating] = useState(false)
  const [showDatePopover, setShowDatePopover] = useState(false)
  const [popoverUp, setPopoverUp] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const stopRef = useRef<(() => void) | null>(null)
  const rowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    return () => { stopRef.current?.() }
  }, [])

  function detectDirection() {
    if (rowRef.current) {
      const rect = rowRef.current.getBoundingClientRect()
      setPopoverUp(window.innerHeight - rect.bottom < 90)
    }
  }

  function openRating() {
    detectDirection()
    setShowRating(prev => !prev)
  }

  function openDatePopover() {
    detectDirection()
    setShowDatePopover(prev => !prev)
  }

  function handleRate(n: number) {
    if (!listened) onToggle()
    onRate(n)
    setShowRating(false)
  }

  async function handlePlay() {
    if (isPlaying) {
      stopRef.current?.()
      stopRef.current = null
      setIsPlaying(false)
      return
    }
    setLoadingPreview(true)
    const res = await fetch(`/api/deezer/track/${trackId}`)
    setLoadingPreview(false)
    if (!res.ok) return
    const { preview } = await res.json()
    if (!preview) return
    setIsPlaying(true)
    const stop = playPreview(preview, () => setIsPlaying(false))
    stopRef.current = stop
  }

  return (
    <div ref={rowRef} className="relative flex items-center gap-3 px-4 py-2.5 hover:bg-bg-tertiary transition-colors group">
      <button
        onClick={onToggle}
        className="group/toggle flex-shrink-0 w-5 h-5 rounded-full border border-border flex items-center justify-center transition-colors hover:border-primary"
        style={listened ? { backgroundColor: 'var(--primary)', borderColor: 'var(--primary)' } : {}}
      >
        {listened
          ? <Check size={10} strokeWidth={3} className="text-white" />
          : <Check size={10} strokeWidth={3} className="opacity-0 group-hover/toggle:opacity-100 text-primary transition-opacity" />
        }
      </button>

      <div className="flex-shrink-0 w-5 flex items-center justify-center">
        {hasPreview ? (
          <button onClick={handlePlay} disabled={loadingPreview} className="relative w-5 h-5 flex items-center justify-center">
            <span className={`${textStyles.caption} text-text-disabled transition-opacity ${isPlaying || loadingPreview ? 'opacity-0' : 'group-hover:opacity-0'}`}>
              {position}
            </span>
            <span className={`absolute inset-0 flex items-center justify-center transition-opacity ${isPlaying ? 'opacity-100 text-primary' : loadingPreview ? 'opacity-100 text-text-disabled animate-pulse' : 'opacity-0 group-hover:opacity-100 text-text-secondary'}`}>
              {isPlaying ? <Pause size={11} fill="currentColor" /> : <Play size={11} fill="currentColor" />}
            </span>
          </button>
        ) : (
          <span className={`${textStyles.caption} text-text-disabled`}>{position}</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <MarqueeText className={`${textStyles.body} text-text-primary`} fromColor="from-bg-secondary">{title}</MarqueeText>
      </div>

      <span className={`${textStyles.caption} text-text-disabled flex-shrink-0`}>
        {formatDuration(duration)}
      </span>

      <div className="relative flex-shrink-0 flex items-center">
        {listened && onSetDate ? (
          <button
            onClick={openDatePopover}
            className={`flex items-center gap-1 transition-colors hover:text-text-primary ${
              listenedAt ? 'text-text-disabled' : 'opacity-0 group-hover:opacity-100 text-text-disabled'
            }`}
          >
            <Calendar size={12} />
            {listenedAt && <span className={textStyles.caption}>{formatDateShort(listenedAt)}</span>}
          </button>
        ) : null}
        {showDatePopover && onSetDate && (
          <DatePopover
            currentDate={listenedAt}
            hasUserDate={!!listenedAtUser}
            releaseDate={releaseDate}
            popoverUp={popoverUp}
            onSetDate={onSetDate}
            onClose={() => setShowDatePopover(false)}
          />
        )}
      </div>

      <div className="flex-shrink-0 w-12 h-6 flex justify-center items-center">
        {!rating && (
          <button
            onClick={openRating}
            className={`${textStyles.caption} text-text-disabled hover:text-text-secondary transition-colors border border-border rounded px-1.5 py-0.5`}
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
            {rating && onRemoveRating && (
              <div className="border-t border-border mt-2 pt-2">
                <button
                  onClick={() => { onRemoveRating(); setShowRating(false) }}
                  className={`${textStyles.caption} text-left px-2 py-1 rounded hover:bg-bg-tertiary transition-colors text-text-secondary hover:text-text-primary w-full`}
                >
                  Retirer la note
                </button>
              </div>
            )}
          </div>
        </>
      )}

    </div>
  )
}
