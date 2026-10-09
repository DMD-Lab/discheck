'use client'

import { useRef, useEffect } from 'react'
import gsap from 'gsap'

interface AnimatedArrowProps {
  direction?: 'left' | 'right'
  size?: number
  className?: string
}

const SHAFT_X1 = 2
const SHAFT_X2_REST = 16
const SHAFT_X2_HOVER = 22
const HEAD_X_HOVER = 6

export default function AnimatedArrow({ direction = 'right', size = 14, className = '' }: AnimatedArrowProps) {
  const shaftRef = useRef<SVGLineElement>(null)
  const headRef = useRef<SVGGElement>(null)

  useEffect(() => {
    const shaft = shaftRef.current
    const head = headRef.current
    const trigger = shaft?.closest('a, button, .group')
    if (!shaft || !head || !trigger) return

    const tl = gsap.timeline({ paused: true })
    tl.to(shaft, { attr: { x2: SHAFT_X2_HOVER }, duration: 0.3, ease: 'power3.out' }, 0)
      .to(head, { x: HEAD_X_HOVER, duration: 0.3, ease: 'power3.out' }, 0)

    const onEnter = () => tl.play()
    const onLeave = () => tl.reverse()
    trigger.addEventListener('mouseenter', onEnter)
    trigger.addEventListener('mouseleave', onLeave)

    return () => {
      trigger.removeEventListener('mouseenter', onEnter)
      trigger.removeEventListener('mouseleave', onLeave)
      tl.kill()
    }
  }, [])

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      style={{ overflow: 'visible', transform: direction === 'left' ? 'scaleX(-1)' : undefined }}
      className={className}
    >
      <line ref={shaftRef} x1={SHAFT_X1} y1="12" x2={SHAFT_X2_REST} y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <g ref={headRef}>
        <polyline points="9 5 16 12 9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  )
}
