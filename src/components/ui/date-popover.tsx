'use client'
import { useRef, useEffect } from 'react'
import { Calendar, X } from 'lucide-react'
import { textStyles } from '@/components/ui/text-styles'

interface DatePopoverProps {
  currentDate?: string | null
  hasUserDate: boolean
  popoverUp?: boolean
  onSetDate: (date: string | null) => void
  onClose: () => void
}

function formatDateDisplay(iso: string): string {
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}/${d.getFullYear()}`
}

export default function DatePopover({ currentDate, hasUserDate, popoverUp, onSetDate, onClose }: DatePopoverProps) {
  const dateInputRef = useRef<HTMLInputElement>(null)
  const pickerOpenRef = useRef(false)

  useEffect(() => {
    const el = dateInputRef.current
    if (!el) return
    const handler = () => {
      if (el.value) {
        onSetDate(`${el.value}T00:00:00.000Z`)
        el.value = ''
        pickerOpenRef.current = false
        onClose()
      }
    }
    el.addEventListener('change', handler)
    return () => el.removeEventListener('change', handler)
  }, [onSetDate, onClose])

  function openPicker() {
    pickerOpenRef.current = true
    dateInputRef.current?.showPicker()
  }

  return (
    <>
      <div
        className="fixed inset-0 z-10"
        onClick={() => { if (!pickerOpenRef.current) onClose() }}
      />
      <div className={`absolute right-0 z-20 bg-bg-secondary border border-border rounded-lg p-3 shadow-lg w-44 ${popoverUp ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
        <div className="flex items-center justify-between mb-2.5">
          <p className={`${textStyles.caption} text-text-disabled`}>Date d&apos;écoute</p>
          <button onClick={onClose} className="text-text-disabled hover:text-text-primary transition-colors">
            <X size={12} />
          </button>
        </div>

        <div className="flex items-center gap-1.5 mb-3">
          <Calendar size={13} className={currentDate ? 'text-text-green' : 'text-text-disabled'} />
          <span className={`${textStyles.body} font-medium ${currentDate ? 'text-text-primary' : 'text-text-disabled'}`}>
            {currentDate ? formatDateDisplay(currentDate) : '—'}
          </span>
        </div>

        <div className="border-t border-border pt-2 flex flex-col">
          <button
            onClick={openPicker}
            className={`${textStyles.caption} text-left px-2 py-1 rounded hover:bg-bg-tertiary transition-colors text-text-secondary hover:text-text-primary`}
          >
            Modifier
          </button>
          {hasUserDate && (
            <button
              onClick={() => { onSetDate(null); onClose() }}
              className={`${textStyles.caption} text-left px-2 py-1 rounded hover:bg-bg-tertiary transition-colors text-text-secondary hover:text-text-primary`}
            >
              Réinitialiser
            </button>
          )}
        </div>

        <input
          ref={dateInputRef}
          type="date"
          className="sr-only"
          max={new Date().toISOString().slice(0, 10)}
          onBlur={() => { pickerOpenRef.current = false }}
        />
      </div>
    </>
  )
}
