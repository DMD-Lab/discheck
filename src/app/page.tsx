import Image from 'next/image'
import { Link } from 'next-view-transitions'
import { Disc3, Star, BarChart2, ArrowRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button-variants'
import { textStyles } from '@/components/ui/text-styles'
import DischecLogo from '@/components/ui/DischecLogo'
import ThemeToggle from '@/components/ui/ThemeToggle'

const features = [
  {
    icon: Disc3,
    title: 'Explorez sans limite',
    description: 'Parcourez les discographies complètes de vos artistes et voyez exactement où vous en êtes, album par album.',
  },
  {
    icon: Star,
    title: 'Notez ce que vous aimez',
    description: "Chaque évaluation enrichit votre profil et révèle vos goûts avec une précision que vous n'attendiez pas.",
  },
  {
    icon: BarChart2,
    title: 'Votre portrait musical révélé',
    description: "Discheck assemble vos genres, top artistes et tendances pour composer un portrait musical précis et surprenant.",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden relative flex flex-col">

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

      <header className="relative flex items-center justify-end gap-4 px-4 py-4 md:px-10 md:py-5" style={{ zIndex: 2 }}>
        <ThemeToggle />
        <Link href="/login" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
          Se connecter
          <ArrowRight size={14} />
        </Link>
      </header>

      <main className="relative flex-1 flex flex-col justify-center px-4 pb-8 md:px-14 md:pb-6" style={{ zIndex: 2 }}>

        <div className="mb-10 max-w-2xl gap-6 flex flex-col">
          <DischecLogo height={40} variant="auto" className="self-start sm:hidden" />
          <DischecLogo height={60} variant="auto" className="self-start hidden sm:flex" />
          <h1 className={`${textStyles.display} text-text-green`}>
            Découvrez ce que votre<br />musique dit de vous.
          </h1>
          <p className={`${textStyles.bodyLg} text-text-secondary`}>
            Suivez vos écoutes, notez vos albums et laissez-nous révéler le profil musical unique qui se cache derrière vos goûts.
          </p>
          <Link
            href="/login?view=register"
            className={buttonVariants({ variant: 'primary', size: 'lg', className: 'w-fit self-start' })}
          >
            Commencer
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-4xl">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-xl border border-border bg-bg-secondary/40 backdrop-blur-sm px-4 py-4 flex flex-col gap-3"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 12%, transparent)' }}
              >
                <Icon size={22} style={{ color: 'var(--primary)' }} />
              </div>
              <p className={`${textStyles.cardTitle} text-text-primary`}>{title}</p>
              <p className={`${textStyles.body} text-text-secondary leading-relaxed`}>{description}</p>
            </div>
          ))}
        </div>

      </main>

      <footer className="relative px-4 py-4 md:px-14 flex items-center justify-between" style={{ zIndex: 2 }}>
        <p className={`${textStyles.caption} text-text-disabled`}>
          Données musicales :{' '}
          <a href="https://developers.deezer.com" target="_blank" rel="noopener noreferrer" className="hover:text-text-secondary transition-colors">
            Deezer
          </a>
          {' '}·{' '}
          <a href="https://musicbrainz.org" target="_blank" rel="noopener noreferrer" className="hover:text-text-secondary transition-colors">
            MusicBrainz
          </a>
        </p>
        <Link href="/legal" className={`${textStyles.caption} text-text-disabled hover:text-text-secondary transition-colors`}>
          Mentions légales
        </Link>
      </footer>

    </div>
  )
}
