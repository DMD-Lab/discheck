'use client'

import { useRef, useState, useEffect } from 'react'

export default function MarqueeText({
  children,
  className = '',
  fromColor = 'from-bg-primary',
}: {
  children: string
  className?: string
  fromColor?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const [distance, setDistance] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const measure = () => {
      if (!containerRef.current || !textRef.current) return
      const overflow = textRef.current.scrollWidth - containerRef.current.clientWidth
      setDistance(Math.max(0, overflow))
    }

    document.fonts.ready.then(measure)

    const ro = new ResizeObserver(measure)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [children])

  const isOverflowing = distance > 0

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden cursor-default"
      onMouseEnter={() => isOverflowing && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span
        ref={textRef}
        className={`${className} inline-block whitespace-nowrap`}
        style={{
          transform: isHovered ? `translateX(-${distance}px)` : 'translateX(0)',
          transition: isHovered
            ? `transform ${Math.max(1, distance / 120)}s linear`
            : 'transform 0.4s ease-out',
        }}
      >
        {children}
      </span>
      {isOverflowing && !isHovered && (
        <div className={`absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l ${fromColor} to-transparent pointer-events-none`} />
      )}
    </div>
  )
}
