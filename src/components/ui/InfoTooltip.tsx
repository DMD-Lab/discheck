'use client'

import { useRef, useState, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { Info } from 'lucide-react'
import { textStyles } from '@/components/ui/text-styles'

const POPUP_WIDTH = 220
const MARGIN = 8

export default function InfoTooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false)
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useLayoutEffect(() => {
    if (!show || !triggerRef.current) return

    function updatePosition() {
      const rect = triggerRef.current!.getBoundingClientRect()
      const left = Math.min(
        Math.max(rect.left + rect.width / 2 - POPUP_WIDTH / 2, MARGIN),
        window.innerWidth - POPUP_WIDTH - MARGIN
      )
      setPosition({ top: rect.top - MARGIN, left })
    }

    updatePosition()
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [show])

  return (
    <>
      <button
        ref={triggerRef}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(v => !v)}
        className="text-text-disabled hover:text-text-secondary transition-colors"
        aria-label="En savoir plus"
      >
        <Info size={13} />
      </button>

      {show && position && createPortal(
        <div
          className="fixed w-[220px] -translate-y-full bg-bg-secondary border border-border rounded-lg px-3 py-2.5 shadow-lg z-[70] pointer-events-none"
          style={{ top: position.top, left: position.left }}
        >
          <p className={`${textStyles.caption} text-text-secondary leading-relaxed`}>{text}</p>
        </div>,
        document.body
      )}
    </>
  )
}
