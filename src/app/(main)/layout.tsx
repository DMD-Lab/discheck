import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'
import { FavoritesProvider } from '@/context/FavoritesContext'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('pseudo')
    .eq('id', user.id)
    .single()

  return (
    <FavoritesProvider userId={user.id}>
      <div className="flex">
        <Sidebar pseudo={profile?.pseudo ?? ''} />
        <main className="ml-56 flex-1 min-h-screen">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </FavoritesProvider>
  )
}
