'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTransitionRouter } from 'next-view-transitions'
import { Lock, Eye, EyeOff, ArrowLeft, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import AppButton from '@/components/ui/AppButton'
import { textStyles } from '@/components/ui/text-styles'
import { buttonVariants } from '@/components/ui/button-variants'
import DischecLogo from '@/components/ui/DischecLogo'
import DischecLoader from '@/components/ui/DischecLoader'
import ThemeToggle from '@/components/ui/ThemeToggle'

export default function ResetPasswordPage() {
  const router = useTransitionRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }
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
        <ArrowLeft size={14} />
        Retour
      </Link>

      <div className="absolute top-5 right-6 z-10">
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-sm px-6">

        {loading && (
          <div className="auth-overlay fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
            <DischecLoader size={64} />
          </div>
        )}

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

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <PasswordField
              placeholder="Nouveau mot de passe"
              value={password}
              onChange={setPassword}
              show={showPassword}
              onToggle={() => setShowPassword(p => !p)}
            />
            <PasswordField
              placeholder="Confirmer le mot de passe"
              value={confirmPassword}
              onChange={setConfirmPassword}
              show={showConfirm}
              onToggle={() => setShowConfirm(p => !p)}
            />
            {error && <p className={`${textStyles.caption} text-error`}>{error}</p>}
            <AppButton
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              loading={loading}
              rightIcon={<ArrowRight size={14} />}
            >
              Changer mon mot de passe
            </AppButton>
          </form>

        </div>
      </div>
    </div>
  )
}

function PasswordField({ placeholder, value, onChange, show, onToggle }: {
  placeholder: string
  value: string
  onChange: (v: string) => void
  show: boolean
  onToggle: () => void
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
        minLength={6}
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
