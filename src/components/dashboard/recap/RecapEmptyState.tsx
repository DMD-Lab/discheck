import type { CSSProperties, ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import DischecLogo from '@/components/ui/DischecLogo'
import AnimatedArrow from '@/components/ui/AnimatedArrow'
import { buttonVariants } from '@/components/ui/button-variants'

export default function RecapEmptyState({
  message,
  ctaLabel,
  ctaHref,
}: {
  message: ReactNode
  ctaLabel: string
  ctaHref: string
}) {
  // same blend-to-page-background technique as the landing/login pages, on all 4 edges
  const edgeBlend: CSSProperties = {
    background: [
      'linear-gradient(to right, var(--bg-primary) 0%, transparent 24%, transparent 76%, var(--bg-primary) 100%)',
      'linear-gradient(to bottom, var(--bg-primary) 0%, transparent 24%, transparent 76%, var(--bg-primary) 100%)',
    ].join(', '),
  }

  return (
    <div className="relative w-full flex-1 min-h-[420px] rounded-2xl overflow-hidden">
      <Image
        src="/empty-desk.png"
        alt=""
        fill
        sizes="100vw"
        priority
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0" style={edgeBlend} />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 text-center px-6">
        <DischecLogo height={80} showText={false} variant="white" />
        <p className="text-lg sm:text-xl font-medium text-white max-w-md whitespace-pre-line">{message}</p>
        <Link href={ctaHref} className={buttonVariants({ variant: 'primary', size: 'md' })}>
          {ctaLabel}
          <AnimatedArrow direction="right" size={14} />
        </Link>
      </div>
    </div>
  )
}
