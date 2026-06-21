import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { textStyles } from '@/components/ui/text-styles'
import { buttonVariants } from '@/components/ui/button-variants'
import DischecLogo from '@/components/ui/DischecLogo'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center gap-8 px-4">
      <DischecLogo height={40} />
      <div className="text-center flex flex-col gap-3">
        <p className="text-8xl font-bold text-text-disabled">404</p>
        <h1 className={`${textStyles.sectionTitle} text-text-green`}>Page introuvable</h1>
        <p className={`${textStyles.body} text-text-secondary`}>
          Cette page n&apos;existe pas ou a été déplacée.
        </p>
      </div>
      <Link href="/dashboard" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
        <ArrowLeft size={14} />
        Retour à l&apos;accueil
      </Link>
    </div>
  )
}
