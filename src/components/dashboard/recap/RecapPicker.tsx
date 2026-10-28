'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import DischecLoader from '@/components/ui/DischecLoader'
import { MONTH_NAMES } from '@/lib/period-label'

export type PickerMode = 'month' | 'year'

const MONTH_SHORT = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

export default function RecapPicker({
  mode,
  year,
  month,
  minYear,
  minMonth,
}: {
  mode: PickerMode
  year: number
  month: number
  minYear: number
  minMonth: number
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [pickerYear, setPickerYear] = useState(year)
  const [prevIsPickerOpen, setPrevIsPickerOpen] = useState(isPickerOpen)
  const popoverRef = useRef<HTMLDivElement>(null)

  // avoids setState-in-effect lint
  if (isPickerOpen !== prevIsPickerOpen) {
    setPrevIsPickerOpen(isPickerOpen)
    if (isPickerOpen) setPickerYear(year)
  }

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  // null deletes the key
  function push(params: Record<string, string | null>) {
    const sp = new URLSearchParams(searchParams.toString())
    Object.entries(params).forEach(([key, value]) => {
      if (value === null) sp.delete(key)
      else sp.set(key, value)
    })
    startTransition(() => {
      const query = sp.toString()
      router.push(query ? `${pathname}?${query}` : pathname)
    })
  }

  const canGoPrev = mode === 'year'
    ? year > minYear
    : year > minYear || (year === minYear && month > minMonth)
  const canGoNext = mode === 'year'
    ? year < currentYear
    : year < currentYear || (year === currentYear && month < currentMonth)

  function goPrev() {
    if (!canGoPrev) return
    if (mode === 'year') { push({ mode: 'year', year: String(year - 1), month: null }); return }
    if (month === 1) push({ mode: null, year: String(year - 1), month: '12' })
    else push({ mode: null, year: String(year), month: String(month - 1) })
  }

  function goNext() {
    if (!canGoNext) return
    if (mode === 'year') { push({ mode: 'year', year: String(year + 1), month: null }); return }
    if (month === 12) push({ mode: null, year: String(year + 1), month: '1' })
    else push({ mode: null, year: String(year), month: String(month + 1) })
  }

  function switchMode(next: PickerMode) {
    if (next === mode) return
    if (next === 'year') push({ mode: 'year', year: String(year), month: null })
    else push({ mode: null, year: String(currentYear), month: String(currentMonth) })
  }

  function isMonthDisabled(y: number, m: number) {
    if (y > currentYear || (y === currentYear && m > currentMonth)) return true
    if (y < minYear || (y === minYear && m < minMonth)) return true
    return false
  }

  function selectMonth(m: number) {
    if (isMonthDisabled(pickerYear, m)) return
    push({ mode: null, year: String(pickerYear), month: String(m) })
    setIsPickerOpen(false)
  }

  function selectYear(y: number) {
    push({ mode: 'year', year: String(y), month: null })
    setIsPickerOpen(false)
  }

  useEffect(() => {
    if (!isPickerOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsPickerOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isPickerOpen])

  const label = mode === 'year' ? String(year) : `${MONTH_NAMES[month - 1]} ${year}`
  const years = Array.from({ length: currentYear - minYear + 1 }, (_, i) => currentYear - i)

  return (
    <>
      {isPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/60 backdrop-blur-[2px] pointer-events-none">
          <DischecLoader size={80} />
        </div>
      )}
      <div className="fixed top-[86px] right-4 md:right-8 lg:right-16 z-30 flex items-center gap-3">
        <div className="flex items-center gap-0.5 bg-bg-tertiary rounded-full p-0.5">
          {(['month', 'year'] as const).map(m => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                mode === m ? 'bg-bg-primary text-text-primary' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {m === 'month' ? 'Mois' : 'Année'}
            </button>
          ))}
        </div>

        <div className="relative" ref={popoverRef}>
          <div className="flex items-center gap-0.5 bg-bg-tertiary rounded-full p-0.5">
            <button
              onClick={goPrev}
              disabled={!canGoPrev}
              className="w-6 h-6 flex items-center justify-center rounded-full text-text-secondary hover:text-text-primary hover:bg-bg-primary transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => setIsPickerOpen(prev => !prev)}
              className="text-xs font-medium text-text-primary w-28 text-center tabular-nums rounded-full py-1 hover:bg-bg-primary transition-colors"
            >
              {label}
            </button>
            <button
              onClick={goNext}
              disabled={!canGoNext}
              className="w-6 h-6 flex items-center justify-center rounded-full text-text-secondary hover:text-text-primary hover:bg-bg-primary transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          {isPickerOpen && (
            <div className="absolute right-0 top-full mt-2 bg-bg-primary border border-border rounded-xl shadow-lg p-3 z-40">
              {mode === 'month' ? (
                <>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <button
                      onClick={() => setPickerYear(y => y - 1)}
                      disabled={pickerYear <= minYear}
                      className="w-6 h-6 flex items-center justify-center rounded-full text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <span className="text-sm font-semibold text-text-primary tabular-nums">{pickerYear}</span>
                    <button
                      onClick={() => setPickerYear(y => y + 1)}
                      disabled={pickerYear >= currentYear}
                      className="w-6 h-6 flex items-center justify-center rounded-full text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-1 w-48">
                    {MONTH_SHORT.map((name, i) => {
                      const m = i + 1
                      const disabled = isMonthDisabled(pickerYear, m)
                      const isCurrent = pickerYear === year && m === month
                      return (
                        <button
                          key={m}
                          onClick={() => selectMonth(m)}
                          disabled={disabled}
                          className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-30 disabled:pointer-events-none ${
                            isCurrent ? 'bg-primary text-bg-primary' : 'text-text-primary hover:bg-bg-tertiary'
                          }`}
                        >
                          {name}
                        </button>
                      )
                    })}
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-0.5 max-h-48 overflow-y-auto w-24">
                  {years.map(y => (
                    <button
                      key={y}
                      onClick={() => selectYear(y)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium text-center transition-colors ${
                        y === year ? 'bg-primary text-bg-primary' : 'text-text-primary hover:bg-bg-tertiary'
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
