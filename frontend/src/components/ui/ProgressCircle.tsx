// Propiedades recibidas para dibujar el anillo circular de progreso SVG.
interface ProgressCircleProps {
  percentage: number // Porcentaje del progreso (0 a 100).
  size?: number // Tamaño general del contenedor en píxeles.
  strokeWidth?: number // Grosor de la línea del círculo.
  showText?: boolean // Si se desea dibujar el número de porcentaje en el centro.
  className?: string
}

export function ProgressCircle({
  percentage = 0,
  size = 100,
  strokeWidth = 8,
  showText = true,
  className = '',
}: ProgressCircleProps) {
  // Aseguramos que el valor esté acotado entre 0 y 100
  const normalizedPercentage = Math.min(100, Math.max(0, percentage))
  
  // Parámetros matemáticos para calcular el círculo SVG dinámico
  const radius = 36 // Radio del círculo
  const circumference = 2 * Math.PI * radius // Circunferencia total (aproximadamente 226)
  // Calculamos la distancia de desplazamiento para el trazo SVG (strokeDashoffset).
  // 0 desplazamiento significa círculo completo, total circunferencia de desplazamiento significa vacío.
  const strokeDashoffset = circumference - (normalizedPercentage / 100) * circumference

  return (
    <div 
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }} // Aplica el tamaño dinámico
    >
      <svg
        className="w-full h-full -rotate-90 transform overflow-visible" // Lo rotamos -90 grados para que empiece a llenarse desde arriba
        viewBox="0 0 100 100"
      >
        <defs>
          {/* Un filtro SVG de brillo tenue (glow) para que el porcentaje activo resalte más moderno */}
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Círculo de Fondo (La pista gris de fondo) */}
        <circle
          className="text-slate-100 dark:text-slate-700/60 stroke-current"
          strokeWidth={strokeWidth}
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
        />
        
        {/* Círculo de Progreso Activo (La barra azul que se llena) */}
        <circle
          className="text-blue-600 dark:text-blue-400 stroke-current transition-all duration-500 ease-out"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round" // Extremos de la línea redondeados
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
          filter="url(#glow)" // Le aplica el brillo definido arriba
        />
      </svg>
      
      {/* Texto centrado que indica el porcentaje exacto */}
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

