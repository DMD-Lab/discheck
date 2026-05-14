import Image from 'next/image'
import { Check } from 'lucide-react'
import type { DeezerAlbumResult } from '@/lib/deezer/types'
import { textStyles } from '@/components/ui/text-styles'

interface ReleaseRowProps {
  album: DeezerAlbumResult
  listenedCount?: number
  total?: number
  rating?: number
  onClick: () => void
  showDivider?: boolean
}

const typeLabel: Record<string, string> = {
  album: 'Album',
  single: 'Single',
  ep: 'EP',
  compilation: 'Compilation',
}

export default function ReleaseRow({ album, listenedCount, total, rating, onClick, showDivider }: ReleaseRowProps) {
  const year = album.release_date?.slice(0, 4) ?? '—'
  const label = typeLabel[album.record_type] ?? album.record_type
  const allListened = !!total && listenedCount !== undefined && listenedCount >= total
  const someListened = !!total && listenedCount !== undefined && listenedCount > 0 && !allListened
  const showBar = !!total && listenedCount !== undefined && listenedCount > 0
  const barPct = showBar && total ? Math.round((listenedCount! / total) * 100) : null

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-4 px-3 py-3 hover:bg-bg-secondary transition-colors text-left w-full group${showDivider ? ' border-b border-border' : ''}`}
    >
      <Image
        src={album.cover_medium}
        alt={album.title}
        width={40}
        height={40}
        className="rounded flex-shrink-0 object-cover"
      />

      <div className="flex-1 min-w-0">
        <p className={`${textStyles.body} font-medium text-text-primary truncate`}>{album.title}</p>
        {showBar && barPct !== null && (
          <div className="mt-1.5 h-0.5 w-3/5 rounded-full overflow-hidden bg-bg-tertiary">
            <div
              className="h-full rounded-full"
              style={{ width: `${barPct}%`, backgroundColor: 'var(--primary)' }}
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="w-12 flex justify-end">
          {rating !== undefined && (
            <span className={`${textStyles.caption} text-text-secondary`}>
              ★ {rating % 1 === 0 ? rating.toFixed(0) : rating.toFixed(1)}
            </span>
          )}
        </div>

        <span className={`${textStyles.caption} text-text-disabled border border-border rounded-full px-2 py-0.5`}>
          {label}
        </span>
        <span className={`${textStyles.caption} text-text-disabled w-10 text-right`}>{year}</span>

        <div className="w-8 flex justify-end">
          {allListened && (
            <span className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--primary)' }}>
              <Check size={11} strokeWidth={3} className="text-white" />
            </span>
          )}
          {someListened && (
            <span className="text-xs font-medium flex-shrink-0" style={{ color: 'var(--primary)' }}>
              {listenedCount}/{total}
            </span>
          )}
          {!allListened && !someListened && (
            <span className="w-6 h-6 rounded-full border border-border flex-shrink-0" />
          )}
        </div>
      </div>
    </button>
  )
}
