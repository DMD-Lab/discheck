'use client'

import { useState } from 'react'
import { Info } from 'lucide-react'
import { textStyles } from '@/components/ui/text-styles'

export default function InfoTooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false)

  return (
    <div className="relative flex items-center">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(v => !v)}
        className="text-text-disabled hover:text-text-secondary transition-colors"
        aria-label="En savoir plus"
      >
        <Info size={13} />
      </button>

      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-[220px] bg-bg-secondary border border-border rounded-lg px-3 py-2.5 shadow-lg z-30 pointer-events-none">
          <p className={`${textStyles.caption} text-text-secondary leading-relaxed`}>{text}</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-border" />
        </div>
      )}
    </div>
  )
}
