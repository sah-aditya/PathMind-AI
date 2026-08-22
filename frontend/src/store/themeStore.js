import { create } from 'zustand'

const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('pathmind_theme')
    if (saved) return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

const applyTheme = (theme) => {
  if (typeof document !== 'undefined') {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('pathmind_theme', theme)
  }
}

// Apply on initial load
const initialTheme = getInitialTheme()
applyTheme(initialTheme)

const useThemeStore = create((set) => ({
  theme: initialTheme,
  toggleTheme: () => set((state) => {
    const next = state.theme === 'dark' ? 'light' : 'dark'
    applyTheme(next)
    return { theme: next }
  }),
  setTheme: (theme) => {
    applyTheme(theme)
    set({ theme })
  },
}))

export default useThemeStore
