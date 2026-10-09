import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SettingsView from '@/components/settings/SettingsView'
import { version } from '../../../../package.json'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('pseudo')
    .eq('id', user.id)
    .single()

  return (
    <SettingsView
      userId={user.id}
      email={user.email ?? ''}
      initialPseudo={profile?.pseudo ?? ''}
      version={version}
    />
  )
}
