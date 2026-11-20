
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const ThemeContext = createContext(null)

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function getSavedTheme() {
  const saved = localStorage.getItem('ashparse-theme')

  return ['light', 'dark', 'system'].includes(saved)
    ? saved
    : 'system'
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getSavedTheme)
  const [systemTheme, setSystemTheme] = useState(getSystemTheme)

  const resolvedTheme = theme === 'system' ? systemTheme : theme

  useEffect(() => {
    localStorage.setItem('ashparse-theme', theme)
  }, [theme])

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (event) => {
      setSystemTheme(event.matches ? 'dark' : 'light')
    }

    media.addEventListener('change', handleChange)

    return () => media.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle(
      'dark',
      resolvedTheme === 'dark'
    )

    document.documentElement.style.colorScheme = resolvedTheme
  }, [resolvedTheme])

  const value = useMemo(
    () => ({ theme, setTheme, resolvedTheme }),
    [theme, resolvedTheme]
  )

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider')
  }

  return context
}
