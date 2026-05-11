interface ProgressCircleProps {
  percentage: number
  size?: number
  strokeWidth?: number
  showText?: boolean
  className?: string
}

export function ProgressCircle({
  percentage = 0,
  size = 100,
  strokeWidth = 8,
  showText = true,
  className = '',
}: ProgressCircleProps) {
  // Asegurar límites entre 0 y 100
  const normalizedPercentage = Math.min(100, Math.max(0, percentage))
  
  // Parámetros para el círculo SVG
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (normalizedPercentage / 100) * circumference

  return (
    <div 
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        className="w-full h-full -rotate-90 transform overflow-visible"
        viewBox="0 0 100 100"
      >
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Círculo de Fondo (Ruta) */}
        <circle
          className="text-slate-100 dark:text-slate-700/60 stroke-current"
          strokeWidth={strokeWidth}
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
        />
        
        {/* Círculo de Progreso (Activo) */}
        <circle
          className="text-blue-600 dark:text-blue-400 stroke-current transition-all duration-500 ease-out"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
          filter="url(#glow)"
        />
      </svg>
      
      {showText && (
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-xl font-black text-slate-800 dark:text-slate-100">
            {Math.round(normalizedPercentage)}%
          </span>
        </div>
      )}
    </div>
  )
}

export default ProgressCircle
