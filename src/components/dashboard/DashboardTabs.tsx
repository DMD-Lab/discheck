'use client'

import { usePathname } from 'next/navigation'
import { Link } from 'next-view-transitions'

const tabs = [
  { href: '/dashboard/home',       label: 'Accueil' },
  { href: '/dashboard/profile',    label: 'Mon profil musical' },
  { href: '/dashboard/collection', label: 'Ma collection' },
]

export default function DashboardTabs() {
  const pathname = usePathname()

  return (
    <div className="flex gap-1 border-b border-border mb-8">
      {tabs.map(({ href, label }) => {
        const active = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              active
                ? 'border-primary text-text-green'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            {label}
          </Link>
        )
      })}
    </div>
  )
}
