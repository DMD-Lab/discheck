'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTransitionRouter } from 'next-view-transitions'
import { createClient } from '@/lib/supabase/client'
import AppButton from '@/components/ui/AppButton'
import PasswordField from '@/components/ui/PasswordField'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import AnimatedArrow from '@/components/ui/AnimatedArrow'
import { textStyles } from '@/components/ui/text-styles'
import { buttonVariants } from '@/components/ui/button-variants'
import DischecLogo from '@/components/ui/DischecLogo'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { PASSWORD_MIN_LENGTH, getPasswordPairErrors, revealPasswordPairErrors } from '@/lib/validation/password'

const EMPTY_PAIR = { password: '', confirmPassword: '' }

export default function ResetPasswordPage() {
  const router = useTransitionRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [attempted, setAttempted] = useState(false)
  const [committed, setCommitted] = useState(EMPTY_PAIR)

  const passwordPair = getPasswordPairErrors(password, confirmPassword)
  const canSave = !passwordPair.passwordError && !passwordPair.confirmError
  const { passwordError, passwordRed, confirmError, confirmRed } = revealPasswordPairErrors(
    attempted,
    committed,
    { password, confirmPassword },
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSave) { setCommitted({ password, confirmPassword }); setAttempted(true); return }
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) {
      setError('Une erreur est survenue. Veuillez refaire une demande de réinitialisation.')
      return
    }
    router.push('/dashboard')
  }

  return (
    <div className="h-screen overflow-hidden relative flex items-center justify-center bg-bg-primary">

      <div className="hidden md:block absolute left-0 top-0 h-full w-[38%] overflow-hidden">
        <Image src="/auth-left.png" alt="" fill sizes="38vw" className="object-cover" loading="eager" aria-hidden />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to right, rgba(15,15,15,0.2) 0%, var(--bg-primary) 100%)' }}
        />
      </div>

      <div className="hidden md:block absolute right-0 top-0 h-full w-[38%] overflow-hidden">
        <Image src="/auth-right.png" alt="" fill sizes="38vw" className="object-cover" loading="eager" aria-hidden />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to left, rgba(15,15,15,0.2) 0%, var(--bg-primary) 100%)' }}
        />
      </div>

      <Link
        href="/login"
        className={buttonVariants({
          variant: 'outline',
          size: 'sm',
          className: 'absolute top-5 left-6 z-10 backdrop-blur-sm bg-bg-secondary/60',
        })}
      >
        <AnimatedArrow direction="left" size={14} />
        Retour
      </Link>

      <div className="absolute top-5 right-6 z-10">
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-sm px-6">

        {loading && <LoadingOverlay />}

        <div className="form-enter">

          <div className="mb-8 flex justify-center">
            <DischecLogo height={40} variant="auto" />
          </div>

          <div className="text-center mb-7">
            <h1 className={`${textStyles.sectionTitle} text-text-green mb-2`}>Nouveau mot de passe</h1>
            <p className={`${textStyles.body} text-text-secondary leading-relaxed max-w-xs mx-auto`}>
              Choisissez un nouveau mot de passe pour votre compte.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
            <div>
              <PasswordField
                placeholder="Nouveau mot de passe"
                value={password}
                onChange={setPassword}
                minLength={PASSWORD_MIN_LENGTH}
                autoComplete="new-password"
                error={passwordRed}
              />
              {passwordError && <p className={`${textStyles.caption} text-error mt-1`}>{passwordError}</p>}
            </div>
            <div>
              <PasswordField
                placeholder="Confirmer le mot de passe"
                value={confirmPassword}
                onChange={setConfirmPassword}
                minLength={PASSWORD_MIN_LENGTH}
                autoComplete="new-password"
                error={confirmRed}
              />
              {confirmError && <p className={`${textStyles.caption} text-error mt-1`}>{confirmError}</p>}
            </div>

            {error && <p className={`${textStyles.caption} text-error`}>{error}</p>}
            <AppButton
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              loading={loading}
              rightIcon={<AnimatedArrow direction="right" size={14} />}
            >
              Changer mon mot de passe
            </AppButton>
          </form>

        </div>
      </div>
    </div>
  )
}
