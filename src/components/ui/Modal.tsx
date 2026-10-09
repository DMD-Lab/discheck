'use client'

import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { textStyles } from './text-styles'

interface ModalProps {
  title: string
  variant?: 'default' | 'danger'
  onClose: () => void
  children: ReactNode
}

export default function Modal({ title, variant = 'default', onClose, children }: ModalProps) {
  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="bg-bg-secondary border border-white/5 rounded-lg shadow-xl w-full max-w-sm"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-white/5">
          <p className={`${textStyles.cardTitle} ${variant === 'danger' ? 'text-error' : 'text-text-green'}`}>{title}</p>
          <button onClick={onClose} className="text-text-disabled hover:text-text-primary transition-colors">
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  )
}
