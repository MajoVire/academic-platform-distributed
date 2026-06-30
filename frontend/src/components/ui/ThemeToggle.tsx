import { useState, useEffect } from 'react'
import { IoSunnyOutline, IoMoonOutline } from 'react-icons/io5'

// Este componente es el botón interruptor del Modo Oscuro/Claro.
export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  // Al cargar el componente, leemos si hay una preferencia guardada en el almacenamiento del navegador (localStorage)
  // o si el sistema operativo del usuario prefiere modo oscuro.
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const systemDark = savedTheme === 'dark' || (!savedTheme && prefersDark)
    
    // Si prefiere oscuro, le añadimos la clase 'dark' a la etiqueta <html> del documento.
    if (systemDark) {
      document.documentElement.classList.add('dark')
      setIsDark(true)
    } else {
      document.documentElement.classList.remove('dark')
      setIsDark(false)
    }
  }, [])

  // Esta función alterna el tema al hacer click en el botón
  const toggleTheme = () => {
    const nextDark = !isDark
    setIsDark(nextDark)
    if (nextDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark') // Guarda la preferencia para la próxima visita
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
        // Si está en modo oscuro, muestra un sol amarillo girando suavemente (animate-spin de 8 segundos)
        <IoSunnyOutline className="w-5 h-5 text-amber-400 animate-[spin_8s_linear_infinite]" />
      ) : (
        // Si está en modo claro, muestra una luna azul
        <IoMoonOutline className="w-5 h-5 text-blue-600" />
      )}
    </button>
  )
}

export default ThemeToggle

