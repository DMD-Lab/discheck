'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'

export default function MarqueeText({
  children,
  className = '',
  fromColor = 'from-bg-primary',
  href,
}: {
  children: string
  className?: string
  fromColor?: string
  href?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLElement>(null)
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

  const textClassName = `${className} inline-block whitespace-nowrap`
  const textStyle = {
    transform: isHovered ? `translateX(-${distance}px)` : 'translateX(0)',
    transition: isHovered
      ? `transform ${Math.max(1, distance / 120)}s linear`
      : 'transform 0.4s ease-out',
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden cursor-default"
      onMouseEnter={() => isOverflowing && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {href ? (
        <Link href={href} ref={textRef as React.Ref<HTMLAnchorElement>} className={textClassName} style={textStyle}>
          {children}
        </Link>
      ) : (
        <span ref={textRef as React.Ref<HTMLSpanElement>} className={textClassName} style={textStyle}>
          {children}
        </span>
      )}
      {isOverflowing && !isHovered && (
        <div className={`absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l ${fromColor} to-transparent pointer-events-none`} />
      )}
    </div>
  )
}
