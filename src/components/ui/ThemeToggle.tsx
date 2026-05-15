'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'light' ? 'dark' : 'light')}
      className="w-8 h-8 rounded-full flex items-center justify-center border border-border bg-bg-secondary/60 backdrop-blur-sm text-text-secondary hover:text-text-primary transition-colors"
      aria-label="Changer le thème"
    >
      {resolvedTheme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
    </button>
  )
}
