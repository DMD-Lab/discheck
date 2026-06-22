import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { textStyles } from '@/components/ui/text-styles'
import DischecLogo from '@/components/ui/DischecLogo'

export const metadata: Metadata = {
  title: 'Mentions légales',
}

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-bg-primary px-4 py-12 md:px-8">
      <div className="max-w-2xl mx-auto">

        <div className="mb-10">
          <Link href="/">
            <DischecLogo height={32} />
          </Link>
        </div>

        <h1 className={`${textStyles.pageTitle} text-text-green mb-10`}>Mentions légales</h1>

        <div className="flex flex-col gap-10">

          <section className="flex flex-col gap-3">
            <h2 className={`${textStyles.cardTitle} text-text-primary`}>Éditeur</h2>
            <p className={`${textStyles.body} text-text-secondary leading-relaxed`}>
              Ce site est édité à titre personnel dans le cadre du projet DMD Lab.<br />
              Contact :{' '}
              <a href="mailto:karim.damad.p@hotmail.com" className="text-primary hover:underline">
                karim.damad.p@hotmail.com
              </a>
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className={`${textStyles.cardTitle} text-text-primary`}>Hébergement</h2>
            <p className={`${textStyles.body} text-text-secondary leading-relaxed`}>
              Hébergement personnel (Raspberry Pi), protégé via Cloudflare Tunnel.<br />
              Base de données :{' '}
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Supabase
              </a>{' '}
              — San Francisco, CA, États-Unis.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className={`${textStyles.cardTitle} text-text-primary`}>Données personnelles</h2>
            <p className={`${textStyles.body} text-text-secondary leading-relaxed`}>
              Discheck collecte uniquement les données nécessaires au fonctionnement du service :
            </p>
            <ul className={`${textStyles.body} text-text-secondary list-disc list-inside flex flex-col gap-1.5`}>
              <li>Adresse email — utilisée uniquement pour l&apos;authentification</li>
              <li>Pseudonyme — affiché dans l&apos;interface</li>
              <li>Historique d&apos;écoute et notations — données de suivi musical personnel</li>
            </ul>
            <p className={`${textStyles.body} text-text-secondary leading-relaxed`}>
              Ces données ne sont transmises à aucun tiers. Vous pouvez demander la suppression
              de votre compte et de l&apos;ensemble de vos données à tout moment en écrivant à{' '}
              <a href="mailto:karim.damad.p@hotmail.com" className="text-primary hover:underline">
                karim.damad.p@hotmail.com
              </a>.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className={`${textStyles.cardTitle} text-text-primary`}>Sources de données</h2>
            <p className={`${textStyles.body} text-text-secondary leading-relaxed`}>
              Les données musicales (artistes, albums, titres, pochettes) sont fournies par l&apos;API{' '}
              <a
                href="https://developers.deezer.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Deezer
              </a>
              .<br />
              Les dates de sortie originales sont enrichies via{' '}
              <a
                href="https://musicbrainz.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                MusicBrainz
              </a>{' '}
              (données sous licence{' '}
              <a
                href="https://creativecommons.org/licenses/by/4.0/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                CC BY 4.0
              </a>
              ).
            </p>
          </section>

        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col items-center gap-1.5">
          <p className={`${textStyles.caption} text-text-disabled`}>Discheck v1.0.0</p>
          <Image src="/dmdlab_logo_white.png" alt="DMD Lab" width={1024} height={1024} style={{ width: '80px', height: 'auto' }} className="opacity-40 invert dark:invert-0" />
        </div>

      </div>
    </div>
  )
}
