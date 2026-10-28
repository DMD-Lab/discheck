'use client'

import Image from 'next/image'
import MarqueeText from '@/components/ui/marquee-text'
import { textStyles } from '@/components/ui/text-styles'

const COMPACT_VISIBLE_COUNT = 3

// rest shows from lg: up
export function RecapRowSlot({ index, children }: { index: number; children: React.ReactNode }) {
  return (
    <div className={`w-full lg:w-auto ${index >= COMPACT_VISIBLE_COUNT ? 'hidden lg:block' : ''}`}>
      {children}
    </div>
  )
}

export default function RecapRow({
  coverXl,
  title,
  artistName,
  artistDeezerId,
  mirror = false,
  children,
}: {
  coverXl: string
  title: string
  artistName: string
  artistDeezerId: number
  mirror?: boolean
  children: React.ReactNode
}) {
  return (
    <div data-row className={`flex items-center gap-3 w-full lg:w-auto min-w-0 ${mirror ? 'lg:flex-row-reverse' : ''}`}>
      <div className="relative w-14 h-14 md:w-16 md:h-16 xl:w-20 xl:h-20 rounded-lg overflow-hidden shadow-md flex-shrink-0">
        {coverXl ? (
          <Image src={coverXl} alt={title} fill sizes="80px" className="object-cover" />
        ) : (
          <div className="w-full h-full bg-bg-tertiary" />
        )}
      </div>
      {/* pinned either way */}
      <div className={`flex-1 lg:flex-none flex items-center justify-between lg:justify-start gap-3 min-w-0 ${mirror ? 'lg:flex-row-reverse' : ''}`}>
        <div className={`min-w-0 lg:w-28 xl:w-48 ${mirror ? 'lg:text-right' : ''}`}>
          <MarqueeText className={`${textStyles.caption} font-medium text-text-primary`}>{title}</MarqueeText>
          <MarqueeText href={`/artist/${artistDeezerId}`} className={`link-underline ${textStyles.caption} text-text-secondary`}>
            {artistName}
          </MarqueeText>
        </div>
        <div className={`w-24 flex items-center justify-end gap-1 flex-shrink-0 ${mirror ? 'lg:flex-row-reverse' : ''}`}>
          {children}
        </div>
      </div>
    </div>
  )
}
