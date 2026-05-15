'use client'

import { useState } from 'react'
import { useTransitionRouter } from 'next-view-transitions'
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import AppButton from '@/components/ui/AppButton'
import { textStyles } from '@/components/ui/text-styles'
import LogoImage from '@/components/ui/LogoImage'
import VinylSpinner from '@/components/ui/VinylSpinner'

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
  const [pseudo, setPseudo] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)

  function switchView(v: View) {
    setError('')
    setEmail('')
    setPassword('')
    setPseudo('')
    setForgotSent(false)
    setView(v)
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('Email ou mot de passe incorrect'); setLoading(false); return }
    router.push('/search')
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { pseudo } } })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/search')
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    setForgotSent(true)
  }

  return (
    <div className="flex flex-col items-center">

      {loading && (
        <div className="auth-overlay fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
          <VinylSpinner size={64} />
        </div>
      )}

      {/* Animated form wrapper — key triggers re-mount → animation CSS se rejoue */}
      <div key={view} className="form-enter w-full">

      {/* Logo */}
      <div className="mb-8 flex justify-center">
        <LogoImage height={100} />
      </div>
        <div className="text-center mb-7">
          <h1 className={`${textStyles.sectionTitle} text-text-primary mb-2`}>{titles[view]}</h1>
          <p className={`${textStyles.body} text-text-secondary leading-relaxed max-w-xs mx-auto`}>{subtitles[view]}</p>
        </div>

        {/* LOGIN */}
        {view === 'login' && (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <Field icon={<Mail size={15} />} type="email" placeholder="adresse@email.com"
              value={email} onChange={setEmail} />
            <PasswordField placeholder="••••••••" value={password} onChange={setPassword}
              show={showPassword} onToggle={() => setShowPassword(p => !p)} />
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
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <Field icon={<User size={15} />} type="text" placeholder="pseudo"
              value={pseudo} onChange={setPseudo} autoComplete="off" />
            <Field icon={<Mail size={15} />} type="email" placeholder="adresse@email.com"
              value={email} onChange={setEmail} />
            <PasswordField placeholder="6 caractères minimum" value={password} onChange={setPassword}
              show={showPassword} onToggle={() => setShowPassword(p => !p)} minLength={6} />
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
          <form onSubmit={handleForgot} className="flex flex-col gap-4">
            <Field icon={<Mail size={15} />} type="email" placeholder="adresse@email.com"
              value={email} onChange={setEmail} />
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

function Field({ icon, type, placeholder, value, onChange, autoComplete, minLength }: {
  icon: React.ReactNode
  type: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  autoComplete?: string
  minLength?: number
}) {
  return (
    <div className="flex items-center gap-2.5 bg-bg-secondary/80 border border-border rounded-lg px-3 py-2.5 focus-within:[border-color:var(--primary)] transition-colors">
      <span className="text-text-disabled flex-shrink-0">{icon}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        required
        autoComplete={autoComplete}
        minLength={minLength}
        className={`flex-1 bg-transparent ${textStyles.body} text-text-primary outline-none placeholder:text-text-disabled`}
      />
    </div>
  )
}

function PasswordField({ placeholder, value, onChange, show, onToggle, minLength }: {
  placeholder: string
  value: string
  onChange: (v: string) => void
  show: boolean
  onToggle: () => void
  minLength?: number
}) {
  return (
    <div className="flex items-center gap-2.5 bg-bg-secondary/80 border border-border rounded-lg px-3 py-2.5 focus-within:[border-color:var(--primary)] transition-colors">
      <span className="text-text-disabled flex-shrink-0"><Lock size={15} /></span>
      <input
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        required
        minLength={minLength}
        className={`flex-1 bg-transparent ${textStyles.body} text-text-primary outline-none placeholder:text-text-disabled`}
      />
      <AppButton
        type="button"
        variant="ghost"
        size="xs"
        onClick={onToggle}
        className="p-0 text-text-disabled hover:text-text-secondary hover:bg-transparent"
      >
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
      </AppButton>
    </div>
  )
}
