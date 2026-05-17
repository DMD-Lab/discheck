import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'
import BottomNav from '@/components/layout/BottomNav'
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
    <>
      <FavoritesProvider userId={user.id}>
        <div>
          <Sidebar pseudo={profile?.pseudo ?? ''} />
          <main className="ml-0 md:ml-56 min-h-screen pb-16 md:pb-0 flex flex-col">
            <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col">
              {children}
            </div>
          </main>
        </div>
      </FavoritesProvider>
      <BottomNav />
    </>
  )
}
