import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  // Clases base
  const baseClasses = 'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer hover:scale-[1.01] active:scale-[0.99]'

  // Variantes de estilo
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm border border-transparent',
    secondary: 'bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-100 border border-transparent',
    outline: 'bg-transparent border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300',
    ghost: 'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm border border-transparent',
  }

  // Tamaños
  const sizeClasses = {
    sm: 'px-3.5 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3 text-base',
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Procesando...
        </>
      ) : (
        children
      )}
    </button>
  )
}

export default Button
