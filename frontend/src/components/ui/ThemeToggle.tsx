import { useState, useEffect } from 'react'
import { IoSunnyOutline, IoMoonOutline } from 'react-icons/io5'

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const systemDark = savedTheme === 'dark' || (!savedTheme && prefersDark)
    
    if (systemDark) {
      document.documentElement.classList.add('dark')
      setIsDark(true)
    } else {
      document.documentElement.classList.remove('dark')
      setIsDark(false)
    }
  }, [])

  const toggleTheme = () => {
    const nextDark = !isDark
    setIsDark(nextDark)
    if (nextDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer"
      aria-label="Alternar tema"
    >
      {isDark ? (
        <IoSunnyOutline className="w-5 h-5 text-amber-400 animate-[spin_8s_linear_infinite]" />
      ) : (
        <IoMoonOutline className="w-5 h-5 text-blue-600" />
      )}
    </button>
  )
}

export default ThemeToggle
