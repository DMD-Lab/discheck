import Image from 'next/image'
import { Link } from 'next-view-transitions'
import { Disc3, TrendingUp, History, ArrowRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button-variants'
import { textStyles } from '@/components/ui/text-styles'
import DischecLogo from '@/components/ui/DischecLogo'
import ThemeToggle from '@/components/ui/ThemeToggle'

const features = [
  {
    icon: Disc3,
    title: 'Discographies complètes',
    description: 'Accédez aux discographies complètes de vos artistes préférés, albums et singles réunis.',
  },
  {
    icon: TrendingUp,
    title: 'Suivi de progression',
    description: 'Suivez vos écoutes et actualisez votre progression en cours d\'écoute.',
  },
  {
    icon: History,
    title: 'Historique clair',
    description: 'Retrouvez facilement ce que vous avez écouté et ce qu\'il vous reste à explorer.',
  },
]

export default function LandingPage() {
  return (
    <div className="h-screen overflow-hidden relative flex flex-col">

      <Image
        src="/landing-bg.png"
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-center"
        loading="eager"
        aria-hidden
      />
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to right, var(--bg-primary) 25%, color-mix(in srgb, var(--bg-primary) 65%, transparent) 50%, color-mix(in srgb, var(--bg-primary) 15%, transparent) 100%)',
          zIndex: 1,
        }}
      />

      <header className="relative flex items-center justify-end gap-4 px-10 py-5" style={{ zIndex: 2 }}>
        <ThemeToggle />
        <Link href="/login" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
          Se connecter
          <ArrowRight size={14} />
        </Link>
      </header>

      <main className="relative flex-1 flex flex-col justify-center px-14 pb-6" style={{ zIndex: 2 }}>

        <div className="mb-10 max-w-2xl gap-6 flex flex-col">
          <DischecLogo height={60} variant="auto" className="self-start" />
          <h1 className={`${textStyles.display} text-text-primary`}>
            Suivez votre discographie<br />simplement.
          </h1>
          <p className={`${textStyles.bodyLg} text-text-secondary`}>
            Discheck vous aide à suivre vos artistes préférés, albums et singles.
            Explorez des discographies complètes et suivez votre progression, artiste par artiste.
          </p>
          <Link
            href="/login?view=register"
            className={buttonVariants({ variant: 'primary', size: 'lg', className: 'w-fit self-start' })}
          >
            Commencer
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-3 max-w-2xl">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-xl border border-border bg-bg-secondary/40 backdrop-blur-sm px-4 py-3.5"
            >
              <div className="mb-2.5">
                <Icon size={32} style={{ color: 'var(--primary)' }} />
              </div>
              <p className={`${textStyles.body} font-semibold text-text-primary mb-1`}>{title}</p>
              <p className={`${textStyles.caption} text-text-disabled leading-relaxed`}>{description}</p>
            </div>
          ))}
        </div>

      </main>
    </div>
  )
}
