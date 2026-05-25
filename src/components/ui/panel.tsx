'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

export default function Panel({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const id = requestAnimationFrame(() => setVisible(true))
      return () => cancelAnimationFrame(id)
    } else {
      setVisible(false)
    }
  }, [isOpen])

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
        className="fixed top-0 right-0 h-screen w-full max-w-[600px] z-50 flex flex-col overflow-hidden bg-bg-secondary border-l border-border"
        style={{
          transform: visible ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.25s ease-in-out',
        }}
      >
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
