'use client'

import { usePathname } from 'next/navigation'
import { Link } from 'next-view-transitions'
import { Search, Music2, LogOut, Home } from 'lucide-react'
// import { Settings} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useTransitionRouter } from 'next-view-transitions'
import { textStyles } from '@/components/ui/text-styles'
import DischecLogo from '@/components/ui/DischecLogo'
import Image from 'next/image'
import { useFavorites } from '@/context/FavoritesContext'
import { useState, useEffect, useRef } from 'react'
import type { DeezerArtistResult } from '@/lib/deezer/types'

const navItems = [
  { href: '/dashboard', label: 'Accueil', icon: Home },
  { href: '/search', label: 'Recherche', icon: Search },
  { href: '/artists', label: 'Mes artistes', icon: Music2 },
]

interface SidebarProps {
  pseudo: string
}

export default function Sidebar({ pseudo }: SidebarProps) {
  const pathname = usePathname()
  const router = useTransitionRouter()
  const { favorites } = useFavorites()
  const [leavingItems, setLeavingItems] = useState<Map<number, DeezerArtistResult>>(new Map())
  const prevFavorites = useRef<DeezerArtistResult[]>([])

  useEffect(() => {
    const removed = prevFavorites.current.filter(a => !favorites.find(f => f.id === a.id))
    prevFavorites.current = favorites
    if (removed.length === 0) return

    setLeavingItems(prev => {
      const next = new Map(prev)
      removed.forEach(a => { if (!next.has(a.id)) next.set(a.id, a) })
      return next
    })
    removed.forEach(a => {
      setTimeout(() => {
        setLeavingItems(prev => {
          const next = new Map(prev)
          next.delete(a.id)
          return next
        })
      }, 180)
    })
  }, [favorites])

  const displayItems = [
    ...favorites.map(a => ({ artist: a, leaving: false })),
    ...[...leavingItems.values()]
      .filter(a => !favorites.find(f => f.id === a.id))
      .map(a => ({ artist: a, leaving: true })),
  ]

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <aside className="hidden md:flex w-56 bg-bg-secondary border-r border-border flex-col fixed left-0 top-0 bottom-0">
      <div className="px-4 py-8 border-b border-border">
        <DischecLogo height={32} />
      </div>

      <nav className="flex-1 px-3 pt-3 flex flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                active
                  ? 'bg-bg-tertiary text-text-primary font-medium'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
              }`}
            >
              <Icon size={16} strokeWidth={1.75} />
              {label}
            </Link>
          )
        })}

        {displayItems.length > 0 && (
          <div className="ml-5 pl-3 border-l border-border flex flex-col gap-0.5">
            {displayItems.map(({ artist, leaving }) => (
              <Link
                key={artist.id}
                href={`/artist/${artist.id}`}
                className={`form-enter flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors ${
                  leaving ? 'form-leave pointer-events-none' : ''
                } ${
                  pathname === `/artist/${artist.id}`
                    ? 'bg-bg-tertiary text-text-primary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
                }`}
              >
                <Image
                  src={artist.picture_medium}
                  alt={artist.name}
                  width={16}
                  height={16}
                  className="rounded-full object-cover flex-shrink-0"
                />
                <span className="text-xs truncate">{artist.name}</span>
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Settings masqué sur desktop — visible uniquement en mobile via BottomNav
      <div className="px-3 pb-2">
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
            pathname.startsWith('/settings')
              ? 'bg-bg-tertiary text-text-primary font-medium'
              : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
          }`}
        >
          <Settings size={16} strokeWidth={1.75} />
          Paramètres
        </Link>
      </div>
      */}

      <div className="px-5 py-5 border-t border-border">
        <p className={`${textStyles.body} font-medium text-text-green mb-1`}>{pseudo}</p>
        <button
          onClick={handleLogout}
          className={`flex items-center gap-2 ${textStyles.caption} text-text-secondary hover:text-error transition-colors`}
        >
          <LogOut size={12} />
          Se déconnecter
        </button>
      </div>
    </aside>
  )
}
