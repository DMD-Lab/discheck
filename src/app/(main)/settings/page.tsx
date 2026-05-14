'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { textStyles } from '@/components/ui/text-styles'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const isDark = theme !== 'light'

  return (
    <div className="px-16 py-12">
      <h1 className={`${textStyles.pageTitle} text-text-primary mb-8`}>Paramètres</h1>

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between px-4 py-3 rounded-md hover:bg-bg-secondary transition-colors">
          <div className="flex items-center gap-3">
            {isDark
              ? <Moon size={16} className="text-text-secondary" />
              : <Sun size={16} className="text-text-secondary" />
            }
            <div>
              <p className={`${textStyles.body} font-medium text-text-primary`}>Apparence</p>
              <p className={`${textStyles.caption} text-text-secondary`}>{isDark ? 'Mode sombre' : 'Mode clair'}</p>
            </div>
          </div>

          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="relative w-10 h-6 rounded-full transition-colors"
            style={{ backgroundColor: isDark ? 'var(--primary)' : 'var(--border-color)' }}
          >
            <span
              className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-sm"
              style={{ transform: isDark ? 'translateX(16px)' : 'translateX(0)' }}
            />
          </button>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-border">
        <p className={`${textStyles.caption} text-text-disabled`}>Discheck v0.1.0</p>
        <p className={`${textStyles.caption} text-text-disabled mt-1`}>Une app <span className="text-text-secondary">DMD Lab</span></p>
      </div>
    </div>
  )
}
