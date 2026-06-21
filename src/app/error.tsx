'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { textStyles } from '@/components/ui/text-styles'
import { buttonVariants } from '@/components/ui/button-variants'
import DischecLogo from '@/components/ui/DischecLogo'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center gap-8 px-4">
      <DischecLogo height={40} />
      <div className="text-center flex flex-col gap-3">
        <h1 className={`${textStyles.sectionTitle} text-text-green`}>Une erreur est survenue</h1>
        <p className={`${textStyles.body} text-text-secondary`}>
          Quelque chose s&apos;est mal passé. Tu peux réessayer ou revenir à l&apos;accueil.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className={buttonVariants({ variant: 'primary', size: 'sm' })}
        >
          Réessayer
        </button>
        <Link
          href="/dashboard"
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          <ArrowLeft size={14} />
          Accueil
        </Link>
      </div>
    </div>
  )
}
