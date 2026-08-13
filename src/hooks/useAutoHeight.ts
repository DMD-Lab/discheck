'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export function useAutoHeight(isOpen: boolean) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const content = contentRef.current
    if (!container || !content) return

    function animateTo(height: number) {
      gsap.to(container, { height, duration: 0.3, ease: 'power2.out', overwrite: 'auto' })
    }

    animateTo(isOpen ? content.offsetHeight : 0)

    if (!isOpen) return

    // ResizeObserver fires once immediately on observe() with no real change — skip it
    let skippedFirst = false
    const observer = new ResizeObserver(() => {
      if (!skippedFirst) {
        skippedFirst = true
        return
      }
      animateTo(content.offsetHeight)
    })
    observer.observe(content)
    return () => observer.disconnect()
  }, [isOpen])

  return { containerRef, contentRef }
}
