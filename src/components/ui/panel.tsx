'use client'

import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { X } from 'lucide-react'

export default function Panel({
  isOpen,
  onClose,
  progress = 0,
  children,
}: {
  isOpen: boolean
  onClose: () => void
  progress?: number
  children: React.ReactNode
}) {
  const [visible, setVisible] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const wasComplete = useRef<boolean | null>(null)
  const pct = Math.max(0, Math.min(1, progress))
  const complete = pct >= 1

  useEffect(() => {
    if (isOpen) {
      const id = requestAnimationFrame(() => setVisible(true))
      return () => cancelAnimationFrame(id)
    } else {
      const id = setTimeout(() => setVisible(false), 0)
      return () => clearTimeout(id)
    }
  }, [isOpen])

  useEffect(() => {
    const prev = wasComplete.current
    wasComplete.current = complete
    if (prev !== false || !complete || !panelRef.current) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        panelRef.current,
        { boxShadow: '0 0 0 0 rgba(34,197,94,0)' },
        { boxShadow: '0 0 32px 4px rgba(34,197,94,0.35)', duration: 0.35, ease: 'power2.out', yoyo: true, repeat: 1 }
      )
    })
    return () => ctx.revert()
  }, [complete])

  function handleClose() {
    setVisible(false)
    setTimeout(onClose, 250)
  }

  if (!isOpen && !visible) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        style={{
          backgroundColor: 'rgba(0,0,0,0.5)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.25s ease-in-out',
        }}
        onClick={handleClose}
      />
      <div
        ref={panelRef}
        className="fixed top-0 right-0 h-screen w-full max-w-[600px] z-50 flex flex-col overflow-hidden bg-bg-secondary border-l border-border"
        style={{
          transform: visible ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.25s ease-in-out',
        }}
      >
        <div
          className="absolute left-0 w-[3px] bg-primary pointer-events-none z-10"
          style={{
            top: `${(1 - pct) * 50}%`,
            bottom: `${(1 - pct) * 50}%`,
            transition: 'top 0.3s ease-out, bottom 0.3s ease-out',
          }}
        />
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 w-7 h-7 flex items-center justify-center rounded-full bg-bg-secondary border border-border text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
        >
          <X size={14} />
        </button>
        {children}
      </div>
    </>
  )
}
