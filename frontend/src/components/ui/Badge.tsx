import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'blue' | 'gray' | 'emerald' | 'amber' | 'red' | 'indigo'
  size?: 'sm' | 'md'
  className?: string
}

export function Badge({
  children,
  variant = 'blue',
  size = 'md',
  className = '',
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center gap-1 font-semibold rounded-full tracking-wide select-none'

  const variantClasses = {
    blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-100/55 dark:border-blue-900/30',
    gray: 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-transparent',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/30',
    amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-100/50 dark:border-amber-900/30',
    red: 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-100/50 dark:border-red-900/30',
    indigo: 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/30',
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
  }

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {children}
    </span>
  )
}

export default Badge
