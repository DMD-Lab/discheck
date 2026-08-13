import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { textStyles } from '@/components/ui/text-styles'
import { useAutoHeight } from '@/hooks/useAutoHeight'
import type { DeezerTrackResult } from '@/lib/deezer/types'

interface TrackPickerProps {
  tracks: DeezerTrackResult[]
  selectedIds: number[]
  onToggle: (trackId: number) => void
}

export default function TrackPicker({ tracks, selectedIds, onToggle }: TrackPickerProps) {
  const [listOpen, setListOpen] = useState(true)
  const capped = selectedIds.length >= 5
  const { containerRef, contentRef } = useAutoHeight(listOpen)

  return (
    <div className="flex flex-col gap-1.5 border-t border-white/5 pt-2">
      <button onClick={() => setListOpen(v => !v)} className="flex items-center justify-between w-full">
        <span className={`${textStyles.caption} text-text-disabled`}>{selectedIds.length}/5 sélectionnés</span>
        <ChevronDown
          size={14}
          className={`text-text-disabled transition-transform duration-300 ${listOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <div ref={containerRef} className="overflow-hidden" style={{ height: 0 }}>
        <div ref={contentRef} className="max-h-[180px] overflow-y-auto flex flex-col">
          {tracks.map(track => {
            const selectedIndex = selectedIds.indexOf(track.id)
            const isSelected = selectedIndex !== -1
            const isDisabled = capped && !isSelected
            return (
              <button
                key={track.id}
                type="button"
                onClick={() => onToggle(track.id)}
                disabled={isDisabled}
                className={`flex items-center gap-2 w-full text-left py-1.5 px-1.5 rounded transition-opacity ${
                  isDisabled ? 'opacity-40 pointer-events-none' : 'hover:bg-bg-tertiary'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded flex items-center justify-center border flex-shrink-0 ${
                    isSelected ? 'bg-primary border-primary' : 'border-border'
                  }`}
                >
                  {isSelected && (
                    <span className="text-[10px] font-bold text-white leading-none">{selectedIndex + 1}</span>
                  )}
                </span>
                <span className={`${textStyles.body} truncate flex-1 ${isSelected ? 'text-text-primary' : 'text-text-secondary'}`}>
                  {track.title}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
