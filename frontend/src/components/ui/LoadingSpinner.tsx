interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({
  size = 'md',
  className = '',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent dark:border-t-blue-500 border-slate-200 dark:border-slate-800 ${sizeClasses[size]}`}
      />
    </div>
  )
}

interface SkeletonProps {
  variant?: 'card' | 'text' | 'circle'
  className?: string
}

export function Skeleton({
  variant = 'text',
  className = '',
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-slate-200/70 dark:bg-slate-800/60 rounded'

  if (variant === 'circle') {
    return <div className={`${baseClasses} rounded-full ${className}`} />
  }

  if (variant === 'card') {
    return (
      <div className={`${baseClasses} rounded-2xl h-64 w-full flex flex-col p-5 justify-between`}>
        <div className="h-1/2 w-full bg-slate-300 dark:bg-slate-700/60 rounded-xl" />
        <div className="space-y-3 mt-4">
          <div className="h-4 w-3/4 bg-slate-300 dark:bg-slate-700/60 rounded" />
          <div className="h-3 w-1/2 bg-slate-300 dark:bg-slate-700/60 rounded" />
        </div>
      </div>
    )
  }

  return <div className={`${baseClasses} h-4 w-full ${className}`} />
}

export default LoadingSpinner
