// WIP WHITE THEME — composant ThemeToggle désactivé (dark-only)
// Réactiver en décommentant le contenu et en l'intégrant dans la Sidebar

// 'use client'
//
// import { useTheme } from 'next-themes'
// import { Sun, Moon } from 'lucide-react'
//
// export default function ThemeToggle() {
//   const { setTheme } = useTheme()
//
//   function toggleTheme() {
//     const current = document.documentElement.getAttribute('data-theme')
//     setTheme(current === 'light' ? 'dark' : 'light')
//   }
//
//   return (
//     <button
//       onClick={toggleTheme}
//       className="w-8 h-8 rounded-full flex items-center justify-center border border-border bg-bg-secondary/60 backdrop-blur-sm text-text-secondary hover:text-text-primary transition-colors"
//       aria-label="Changer le thème"
//     >
//       <Sun size={14} className="theme-light-only" />
//       <Moon size={14} className="theme-dark-only" />
//     </button>
//   )
// }

export default function ThemeToggle() { return null }
