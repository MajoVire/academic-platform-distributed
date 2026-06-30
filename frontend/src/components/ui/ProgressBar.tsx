// Propiedades recibidas para la barra de progreso lineal.
interface ProgressBarProps {
  percentage: number // Porcentaje del progreso (0 a 100).
  height?: 'sm' | 'md' | 'lg' // Grosor de la barra (delgada, mediana, gruesa).
  showText?: boolean // Si se desea mostrar el texto flotante de "Progreso X%".
  className?: string
}

export function ProgressBar({
  percentage = 0,
  height = 'md',
  showText = false,
  className = '',
}: ProgressBarProps) {
  // Nos aseguramos de mantener el valor dentro del rango de porcentaje real (entre 0% y 100%)
  const normalizedPercentage = Math.min(100, Math.max(0, percentage))

  // Tamaños de altura de la barra
  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Texto de progreso superior */}
      {showText && (
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
          <span>Progreso</span>
          <span>{Math.round(normalizedPercentage)}%</span>
        </div>
      )}
      
      {/* El fondo de la barra de progreso */}
      <div className={`w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden ${heightClasses[height]}`}>
        {/* El relleno dinámico azul, con una bonita animación de transición al cambiar de ancho */}
        <div
          className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${normalizedPercentage}%` }}
        />
      </div>
    </div>
  )
}

export default ProgressBar

