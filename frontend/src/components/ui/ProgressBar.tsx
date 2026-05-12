interface ProgressBarProps {
  percentage: number
  height?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

export function ProgressBar({
  percentage = 0,
  height = 'md',
  showText = false,
  className = '',
}: ProgressBarProps) {
  const normalizedPercentage = Math.min(100, Math.max(0, percentage))

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }

  return (
    <div className={`w-full ${className}`}>
      {showText && (
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
          <span>Progreso</span>
          <span>{Math.round(normalizedPercentage)}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden ${heightClasses[height]}`}>
        <div
          className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${normalizedPercentage}%` }}
        />
      </div>
    </div>
  )
}

export default ProgressBar
