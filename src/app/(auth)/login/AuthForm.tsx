'use client'

import { useState } from 'react'
import { useTransitionRouter } from 'next-view-transitions'
import { Mail, User, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import AppButton from '@/components/ui/AppButton'
import Field from '@/components/ui/Field'
import PasswordField from '@/components/ui/PasswordField'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { textStyles } from '@/components/ui/text-styles'
import DischecLogo from '@/components/ui/DischecLogo'
import { PSEUDO_MAX_LENGTH, getPseudoError, getPseudoDisplayError } from '@/lib/validation/pseudo'
import {
  PASSWORD_MIN_LENGTH,
  getPasswordPairErrors,
  revealPasswordPairErrors,
  getLoginPasswordError,
  getLoginPasswordDisplayError,
} from '@/lib/validation/password'
import { getEmailError, getEmailDisplayError } from '@/lib/validation/email'

interface RegisterSnapshot {
  pseudo: string
  email: string
  password: string
  confirmPassword: string
}

const EMPTY_SNAPSHOT: RegisterSnapshot = { pseudo: '', email: '', password: '', confirmPassword: '' }

interface LoginSnapshot {
  email: string
  password: string
}

const EMPTY_LOGIN_SNAPSHOT: LoginSnapshot = { email: '', password: '' }

export type View = 'login' | 'register' | 'forgot'

const titles: Record<View, string> = {
  login: 'Connexion',
  register: 'Créer un compte',
  forgot: 'Mot de passe oublié',
}

const subtitles: Record<View, string> = {
  login: 'Connectez-vous pour suivre votre discographie, vos écoutes et votre progression.',
  register: 'Créez votre compte et commencez à tracker vos artistes préférés.',
  forgot: 'Entrez votre email, vous recevrez un lien pour réinitialiser votre mot de passe.',
}

export default function AuthForm({ initialView }: { initialView: View }) {
  const router = useTransitionRouter()
  const [view, setView] = useState<View>(initialView)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pseudo, setPseudo] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)
  const [attempted, setAttempted] = useState(false)
  const [committed, setCommitted] = useState<RegisterSnapshot>(EMPTY_SNAPSHOT)
  const [pseudoServerError, setPseudoServerError] = useState<string | null>(null)
  const [emailServerError, setEmailServerError] = useState<string | null>(null)
  const [loginAttempted, setLoginAttempted] = useState(false)
  const [loginCommitted, setLoginCommitted] = useState<LoginSnapshot>(EMPTY_LOGIN_SNAPSHOT)
  const [forgotAttempted, setForgotAttempted] = useState(false)
  const [forgotCommitted, setForgotCommitted] = useState('')

  const passwordPair = getPasswordPairErrors(password, confirmPassword)
  const canRegister = !getPseudoError(pseudo) && !pseudoServerError && !getEmailError(email) && !emailServerError
    && !passwordPair.passwordError && !passwordPair.confirmError
  const canLogin = !getEmailError(email) && !getLoginPasswordError(password)

  const pseudoError = pseudoServerError ?? getPseudoDisplayError(attempted, committed.pseudo, pseudo)
  const emailError = emailServerError ?? getEmailDisplayError(attempted, committed.email, email)
  const { passwordError, passwordRed, confirmError, confirmRed } = revealPasswordPairErrors(
    attempted,
    { password: committed.password, confirmPassword: committed.confirmPassword },
    { password, confirmPassword },
  )

  const loginEmailError = getEmailDisplayError(loginAttempted, loginCommitted.email, email)
  const loginPasswordError = getLoginPasswordDisplayError(loginAttempted, loginCommitted.password, password)

  const canRequestReset = !getEmailError(email)
  const forgotEmailError = getEmailDisplayError(forgotAttempted, forgotCommitted, email)

  function switchView(v: View) {
    setError('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setPseudo('')
    setForgotSent(false)
    setAttempted(false)
    setCommitted(EMPTY_SNAPSHOT)
    setPseudoServerError(null)
    setEmailServerError(null)
    setLoginAttempted(false)
    setLoginCommitted(EMPTY_LOGIN_SNAPSHOT)
    setForgotAttempted(false)
    setForgotCommitted('')
    setView(v)
  }

  async function isPseudoAvailable(value: string): Promise<boolean> {
    const res = await fetch('/api/pseudo/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pseudo: value }),
    })
    const { available } = await res.json()
    return available
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!canLogin) { setLoginCommitted({ email, password }); setLoginAttempted(true); return }
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('Email ou mot de passe incorrect'); setLoading(false); return }
    router.push('/dashboard')
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!canRegister) { setCommitted({ pseudo, email, password, confirmPassword }); setAttempted(true); return }
    setError('')
    setPseudoServerError(null)
    setEmailServerError(null)
    setLoading(true)

    if (!(await isPseudoAvailable(pseudo))) {
      setPseudoServerError('Ce pseudo est déjà pris.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { pseudo } } })
    if (error) {
      // Supabase never reveals the real cause
      if (error.message.includes('User already registered')) setEmailServerError('Cette adresse email est déjà utilisée.')
      else setError('Une erreur est survenue. Veuillez réessayer.')
      setLoading(false)
      return
    }
    router.push('/dashboard')
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault()
    if (!canRequestReset) { setForgotCommitted(email); setForgotAttempted(true); return }
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/reset-password`,
    })
    setLoading(false)
    if (error) {
      setError(error.message.includes('security purposes')
        ? 'Veuillez patienter quelques secondes avant de réessayer.'
        : 'Une erreur est survenue. Veuillez réessayer.')
      return
    }
    setForgotSent(true)
  }

  return (
    <div className="flex flex-col items-center">

      {loading && <LoadingOverlay />}

      {/* Animated form wrapper — key triggers re-mount → animation CSS se rejoue */}
      <div key={view} className="form-enter w-full">

      {/* Logo */}
      <div className="mb-8 flex justify-center">
        <DischecLogo height={40} variant="auto" />
      </div>

  <div className="text-center mb-7">
          <h1 className={`${textStyles.sectionTitle} text-text-green mb-2`}>{titles[view]}</h1>
          <p className={`${textStyles.body} text-text-secondary leading-relaxed max-w-xs mx-auto`}>{subtitles[view]}</p>
        </div>

        {/* LOGIN */}
        {view === 'login' && (
          <form onSubmit={handleLogin} noValidate className="flex flex-col gap-3">
            <div>
              <Field icon={<Mail size={15} />} type="email" placeholder="Email"
                value={email} onChange={setEmail} error={!!loginEmailError} />
              {loginEmailError && <p className={`${textStyles.caption} text-error mt-1`}>{loginEmailError}</p>}
            </div>
            <div>
              <PasswordField placeholder="Mot de passe" value={password} onChange={setPassword} error={!!loginPasswordError} />
              {loginPasswordError && <p className={`${textStyles.caption} text-error mt-1`}>{loginPasswordError}</p>}
            </div>
            <div className="flex justify-end -mt-1">
              <AppButton type="button" variant="link" size="xs" className="text-xs" onClick={() => switchView('forgot')}>
                Mot de passe oublié ?
              </AppButton>
            </div>
            {error && <p className={`${textStyles.caption} text-error`}>{error}</p>}
            <AppButton
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              loading={loading}
              rightIcon={<ArrowRight size={14} />}
            >
              Se connecter
            </AppButton>
            <p className={`${textStyles.caption} text-center text-text-disabled mt-2`}>
              Pas encore de compte ?{' '}
              <AppButton type="button" variant="link" size="xs" onClick={() => switchView('register')}>
                S&apos;inscrire
              </AppButton>
            </p>
          </form>
        )}

        {/* REGISTER */}
        {view === 'register' && (
          <form onSubmit={handleRegister} noValidate className="flex flex-col gap-3">
            <div>
              <Field icon={<User size={15} />} type="text" placeholder="Pseudo"
                value={pseudo} onChange={v => { setPseudo(v); setPseudoServerError(null) }}
                autoComplete="off" maxLength={PSEUDO_MAX_LENGTH} error={!!pseudoError} />
              {pseudoError && <p className={`${textStyles.caption} text-error mt-1`}>{pseudoError}</p>}
            </div>

            <div>
              <Field icon={<Mail size={15} />} type="email" placeholder="Email"
                value={email} onChange={v => { setEmail(v); setEmailServerError(null) }} error={!!emailError} />
              {emailError && <p className={`${textStyles.caption} text-error mt-1`}>{emailError}</p>}
            </div>

            <div>
              <PasswordField placeholder="Mot de passe" value={password} onChange={setPassword}
                minLength={PASSWORD_MIN_LENGTH} autoComplete="new-password" error={passwordRed} />
              {passwordError && <p className={`${textStyles.caption} text-error mt-1`}>{passwordError}</p>}
            </div>
            <div>
              <PasswordField placeholder="Confirmer le mot de passe" value={confirmPassword} onChange={setConfirmPassword}
                minLength={PASSWORD_MIN_LENGTH} autoComplete="new-password" error={confirmRed} />
              {confirmError && <p className={`${textStyles.caption} text-error mt-1`}>{confirmError}</p>}
            </div>

            {error && <p className={`${textStyles.caption} text-error`}>{error}</p>}
            <AppButton
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              loading={loading}
              rightIcon={<ArrowRight size={14} />}
            >
              Créer mon compte
            </AppButton>
            <p className={`${textStyles.caption} text-center text-text-disabled mt-2`}>
              Déjà un compte ?{' '}
              <AppButton type="button" variant="link" size="xs" onClick={() => switchView('login')}>
                Se connecter
              </AppButton>
            </p>
          </form>
        )}

        {/* FORGOT */}
        {view === 'forgot' && !forgotSent && (
          <form onSubmit={handleForgot} noValidate className="flex flex-col gap-3">
            <div>
              <Field icon={<Mail size={15} />} type="email" placeholder="Email"
                value={email} onChange={setEmail} error={!!forgotEmailError} />
              {forgotEmailError && <p className={`${textStyles.caption} text-error mt-1`}>{forgotEmailError}</p>}
            </div>
            {error && <p className={`${textStyles.caption} text-error`}>{error}</p>}
            <AppButton
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              loading={loading}
              rightIcon={<ArrowRight size={14} />}
            >
              Envoyer le lien
            </AppButton>
            <p className={`${textStyles.caption} text-center text-text-disabled mt-2`}>
              <AppButton type="button" variant="link" size="xs" className="text-xs" onClick={() => switchView('login')}>
                Retour à la connexion
              </AppButton>
            </p>
          </form>
        )}

        {view === 'forgot' && forgotSent && (
          <div className="form-enter text-center">
            <p className={`${textStyles.body} text-text-primary mb-1 font-medium`}>Email envoyé</p>
            <p className={`${textStyles.caption} text-text-secondary mb-6`}>
              Vérifiez votre boîte mail et cliquez sur le lien pour réinitialiser votre mot de passe.
            </p>
            <AppButton type="button" variant="link" className="text-xs" onClick={() => switchView('login')}>
              Retour à la connexion
            </AppButton>
          </div>
        )}
      </div>
    </div>
  )
}
