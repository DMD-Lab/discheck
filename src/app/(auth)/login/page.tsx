import Image from 'next/image'
import { Link } from 'next-view-transitions'
import { ArrowLeft } from 'lucide-react'
import AuthForm, { type View } from './AuthForm'
import { buttonVariants } from '@/components/ui/button-variants'
import ThemeToggle from '@/components/ui/ThemeToggle'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>
}) {
  const { view: v } = await searchParams
  const initialView: View = v === 'register' ? 'register' : v === 'forgot' ? 'forgot' : 'login'

  return (
    <div className="h-screen overflow-hidden relative flex items-center justify-center bg-bg-primary">

      {/* Image gauche — masquée sur mobile */}
      <div className="hidden md:block absolute left-0 top-0 h-full w-[38%] overflow-hidden">
        <Image src="/auth-left.png" alt="" fill sizes="38vw" className="object-cover" loading="eager" aria-hidden />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to right, rgba(15,15,15,0.2) 0%, var(--bg-primary) 100%)' }}
        />
      </div>

      {/* Image droite — masquée sur mobile */}
      <div className="hidden md:block absolute right-0 top-0 h-full w-[38%] overflow-hidden">
        <Image src="/auth-right.png" alt="" fill sizes="38vw" className="object-cover" loading="eager" aria-hidden />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to left, rgba(15,15,15,0.2) 0%, var(--bg-primary) 100%)' }}
        />
      </div>

      {/* Bouton retour */}
      <Link
        href="/"
        className={buttonVariants({
          variant: 'outline',
          size: 'sm',
          className: 'absolute top-5 left-6 z-10 backdrop-blur-sm bg-bg-secondary/60',
        })}
      >
        <ArrowLeft size={14} />
        Retour
      </Link>

      {/* Bouton thème */}
      <div className="absolute top-5 right-6 z-10">
        <ThemeToggle />
      </div>

      {/* Formulaire centré */}
      <div className="relative z-10 w-full max-w-sm px-6">
        <AuthForm initialView={initialView} />
      </div>

    </div>
  )
}
