'use client'

import { usePathname } from 'next/navigation'
import { Link } from 'next-view-transitions'
import { Search, Music2, Settings } from 'lucide-react'

const navItems = [
  { href: '/search', label: 'Recherche', icon: Search },
  { href: '/artists', label: 'Mes artistes', icon: Music2 },
  { href: '/settings', label: 'Paramètres', icon: Settings },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg-secondary border-t border-border">
      <div className="flex">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
                active ? 'text-text-primary' : 'text-text-secondary'
              }`}
            >
              <Icon size={20} strokeWidth={1.75} />
              <span className="text-[10px] leading-none">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
