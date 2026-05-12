import { Link } from 'react-router'
import { 
  IoBookOutline, 
  IoBarChartOutline, 
  IoSparklesOutline, 
  IoArrowForward, 
  IoChevronForwardOutline,
} from 'react-icons/io5'

// Componente para la Ilustración Isométrica de Servidores y Nube
const IsometricIllustration = () => (
  <svg viewBox="0 0 400 320" className="w-full h-full max-h-[320px] select-none pointer-events-none drop-shadow-2xl overflow-visible">
    <defs>
      {/* Gradients for glow */}
      <linearGradient id="serverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.03" />
      </linearGradient>
      <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.02" />
      </linearGradient>
      <linearGradient id="dbGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
      </linearGradient>
    </defs>

    {/* ==========================================
        ISOMETRIC CLOUD (Top Right)
        ========================================== */}
    <g transform="translate(40, -10)">
      {/* Cloud shadow or base plane */}
      <ellipse cx="230" cy="110" rx="65" ry="30" fill="#020617" fillOpacity="0.25" filter="blur(10px)" />
      
      {/* Isometric Cloud shape */}
      <path 
        d="M 180,105 C 180,90 195,80 210,80 C 215,70 235,65 250,75 C 265,65 285,75 285,90 C 295,95 300,105 295,115 C 295,125 280,130 265,130 L 195,130 C 185,130 180,120 180,105 Z" 
        fill="url(#cloudGrad)" 
        stroke="#ffffff" 
        strokeWidth="1.2" 
        strokeOpacity="0.3" 
      />
      
      {/* Internal decorative lines */}
      <path d="M 200,115 Q 230,120 265,112" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.15" fill="none" />
      <path d="M 220,95 Q 245,100 270,92" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.15" fill="none" />
    </g>

    {/* ==========================================
        ISOMETRIC DATABASE CYLINDER (Top Left)
        ========================================== */}
    <g transform="translate(-10, -20)">
      {/* Shadow */}
      <ellipse cx="120" cy="100" rx="45" ry="20" fill="#020617" fillOpacity="0.3" filter="blur(8px)" />

      {/* DB Disk Stack */}
      {/* Disk 1 (Bottom) */}
      <path d="M 90,85 L 90,100 A 30,15 0 0 0 150,100 L 150,85 Z" fill="url(#dbGrad)" stroke="#60a5fa" strokeWidth="1" strokeOpacity="0.25" />
      <ellipse cx="120" cy="85" rx="30" ry="15" fill="#1e3a8a" fillOpacity="0.4" stroke="#60a5fa" strokeWidth="1" strokeOpacity="0.3" />
      
      {/* Disk 2 (Middle) */}
      <path d="M 90,65 L 90,80 A 30,15 0 0 0 150,80 L 150,65 Z" fill="url(#dbGrad)" stroke="#60a5fa" strokeWidth="1" strokeOpacity="0.25" />
      <ellipse cx="120" cy="65" rx="30" ry="15" fill="#1e3a8a" fillOpacity="0.4" stroke="#60a5fa" strokeWidth="1" strokeOpacity="0.3" />

      {/* Disk 3 (Top) */}
      <path d="M 90,45 L 90,60 A 30,15 0 0 0 150,60 L 150,45 Z" fill="url(#dbGrad)" stroke="#93c5fd" strokeWidth="1" strokeOpacity="0.3" />
      <ellipse cx="120" cy="45" rx="30" ry="15" fill="#2563eb" fillOpacity="0.5" stroke="#93c5fd" strokeWidth="1.2" strokeOpacity="0.4" />

      {/* Database structural lines */}
      <line x1="90" y1="52" x2="90" y2="92" stroke="#60a5fa" strokeWidth="1" strokeOpacity="0.2" />
      <line x1="150" y1="52" x2="150" y2="92" stroke="#60a5fa" strokeWidth="1" strokeOpacity="0.2" />
    </g>

    {/* ==========================================
        DATA TRANSFER CONNECTIONS (Animated Lines)
        ========================================== */}
    {/* Line DB to Server */}
    <path d="M 120,105 Q 160,140 180,155" fill="none" stroke="#93c5fd" strokeWidth="1.5" strokeOpacity="0.3" />
    <path d="M 120,105 Q 160,140 180,155" fill="none" stroke="#60a5fa" strokeWidth="2" strokeDasharray="6 30" strokeLinecap="round">
      <animate attributeName="stroke-dashoffset" values="100;0" dur="3s" repeatCount="indefinite" />
    </path>

    {/* Line Cloud to Server */}
    <path d="M 270,120 Q 230,145 200,158" fill="none" stroke="#93c5fd" strokeWidth="1.5" strokeOpacity="0.3" />
    <path d="M 270,120 Q 230,145 200,158" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="6 30" strokeLinecap="round">
      <animate attributeName="stroke-dashoffset" values="0;100" dur="3.5s" repeatCount="indefinite" />
    </path>

    {/* ==========================================
        ISOMETRIC SERVERS STACK (Center/Bottom)
        ========================================== */}
    <g transform="translate(0, 20)">
      {/* Base Server Shadow */}
      <ellipse cx="190" cy="245" rx="90" ry="35" fill="#020617" fillOpacity="0.5" filter="blur(12px)" />

      {/* SERVER BLADE 1 (Bottom) */}
      <g transform="translate(0, 60)">
        {/* Left Face */}
        <path d="M 100,150 L 190,195 L 190,212 L 100,167 Z" fill="#1e293b" fillOpacity="0.95" stroke="#334155" strokeWidth="0.8" />
        {/* Right Face */}
        <path d="M 190,195 L 280,150 L 280,167 L 190,212 Z" fill="#0f172a" fillOpacity="0.95" stroke="#334155" strokeWidth="0.8" />
        {/* Top Face */}
        <path d="M 100,150 L 190,105 L 280,150 L 190,195 Z" fill="url(#serverGrad)" stroke="#475569" strokeWidth="0.8" strokeOpacity="0.4" />
        
        {/* Indents and Disk Trays */}
        <line x1="115" y1="159" x2="145" y2="174" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="152" y1="177" x2="177" y2="190" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
        
        {/* LED Light (Orange) */}
        <circle cx="210" cy="183" r="2.2" fill="#f59e0b" />
        <circle cx="210" cy="183" r="4" fill="#f59e0b" fillOpacity="0.4" className="animate-pulse" />
        <circle cx="225" cy="176" r="1.8" fill="#10b981" />
      </g>

      {/* SERVER BLADE 2 (Middle) */}
      <g transform="translate(0, 30)">
        {/* Left Face */}
        <path d="M 100,150 L 190,195 L 190,212 L 100,167 Z" fill="#1e293b" fillOpacity="0.95" stroke="#334155" strokeWidth="0.8" />
        {/* Right Face */}
        <path d="M 190,195 L 280,150 L 280,167 L 190,212 Z" fill="#0f172a" fillOpacity="0.95" stroke="#334155" strokeWidth="0.8" />
        {/* Top Face */}
        <path d="M 100,150 L 190,105 L 280,150 L 190,195 Z" fill="url(#serverGrad)" stroke="#475569" strokeWidth="0.8" strokeOpacity="0.4" />
        
        {/* Indents and Disk Trays */}
        <line x1="115" y1="159" x2="145" y2="174" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="152" y1="177" x2="177" y2="190" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
        
        {/* LED Light (Blue) */}
        <circle cx="210" cy="183" r="2.2" fill="#3b82f6" />
        <circle cx="210" cy="183" r="4" fill="#3b82f6" fillOpacity="0.4" className="animate-pulse" />
        <circle cx="225" cy="176" r="1.8" fill="#10b981" />
      </g>

      {/* SERVER BLADE 3 (Top) */}
      <g transform="translate(0, 0)">
        {/* Left Face */}
        <path d="M 100,150 L 190,195 L 190,212 L 100,167 Z" fill="#334155" fillOpacity="0.95" stroke="#475569" strokeWidth="0.8" />
        {/* Right Face */}
        <path d="M 190,195 L 280,150 L 280,167 L 190,212 Z" fill="#1e293b" fillOpacity="0.95" stroke="#475569" strokeWidth="0.8" />
        {/* Top Face */}
        <path d="M 100,150 L 190,105 L 280,150 L 190,195 Z" fill="url(#serverGrad)" stroke="#64748b" strokeWidth="1.2" strokeOpacity="0.6" />
        
        {/* Indents and Disk Trays */}
        <line x1="115" y1="159" x2="145" y2="174" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="152" y1="177" x2="177" y2="190" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
        
        {/* LED Light (Green) */}
        <circle cx="210" cy="183" r="2.2" fill="#10b981" />
        <circle cx="210" cy="183" r="5" fill="#10b981" fillOpacity="0.5" className="animate-pulse" />
        <circle cx="225" cy="176" r="1.8" fill="#10b981" />
      </g>
    </g>
  </svg>
)

export function HomePage() {
  return (
    <div className="space-y-16 py-4 md:py-8 text-left">
      
      {/* =========================================================================
          Sección Hero (Fondo con Patrón Isométrico Tenue + Ilustración Isométrica)
          ========================================================================= */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 dark:from-slate-900 dark:via-blue-950/40 dark:to-slate-950 p-6 sm:p-8 md:p-14 border border-blue-500/10 dark:border-blue-900/20">
        
        {/* Patrón Isométrico Tenue Integrado en el Fondo */}
        <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06] pointer-events-none select-none text-white">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="isoPattern" width="60" height="104" patternUnits="userSpaceOnUse">
                {/* Isometric grid lines */}
                <path d="M 30,0 L 60,17.32 L 60,51.96 L 30,69.28 L 0,51.96 L 0,17.32 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
                <path d="M 30,0 L 30,34.64 L 0,17.32 M 30,34.64 L 60,17.32 M 30,34.64 L 30,69.28" fill="none" stroke="currentColor" strokeWidth="0.5" />
                
                {/* Micro database cylinder in pattern */}
                <g transform="translate(14, 23) scale(0.4)" stroke="currentColor" strokeWidth="1.2" fill="none">
                  <ellipse cx="15" cy="5" rx="8" ry="3" />
                  <path d="M 7,5 L 7,10 A 8,3 0 0 0 23,10 L 23,5" />
                  <path d="M 7,10 L 7,15 A 8,3 0 0 0 23,15 L 23,10" />
                </g>

                {/* Micro cloud in pattern */}
                <g transform="translate(41, 58) scale(0.35)" stroke="currentColor" strokeWidth="1.2" fill="none">
                  <path d="M 5,12 A 4,4 0 0 1 12,8 A 6,6 0 0 1 24,10 A 5,5 0 0 1 27,18 L 5,18 Z" />
                </g>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#isoPattern)" />
          </svg>
        </div>
        
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.15),transparent_60%)] pointer-events-none" />
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Columna Izquierda Limpia y Refinada */}
          <div className="lg:col-span-7 space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase bg-white/10 dark:bg-blue-500/15 text-blue-100 dark:text-blue-300">
              <IoSparklesOutline className="w-4 h-4 text-blue-200 animate-pulse" />
              Sistemas Distribuidos + Web
            </span>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight tracking-tight">
              Potencia tu <br />
              <span className="bg-gradient-to-r from-blue-200 to-indigo-100 dark:from-blue-400 dark:to-indigo-300 bg-clip-text text-transparent">
                Camino Académico
              </span>
            </h1>
            
            <p className="text-base sm:text-lg text-blue-100/80 dark:text-slate-300 max-w-xl font-medium leading-relaxed">
              Explora materias interactivas de tu plan de estudios, completa recursos en tiempo real mediante procesamiento asíncrono y visualiza tus estadísticas con total fluidez.
            </p>

            {/* Acciones Requeridas: Botón Azul Sólido + Botón Borde Azul */}
            <div className="pt-2 flex flex-wrap gap-4">
              <Link to="/subjects">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm sm:text-base px-6 py-3 rounded-xl shadow-lg shadow-blue-900/30 hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center gap-2 cursor-pointer border border-transparent">
                  Explorar Materias
                  <IoArrowForward className="w-4 h-4" />
                </button>
              </Link>
              <Link to="/progress">
                <button className="bg-transparent hover:bg-blue-600/10 text-white font-extrabold text-sm sm:text-base px-6 py-3 rounded-xl border-2 border-blue-500 hover:border-blue-400 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer">
                  Mi Progreso
                </button>
              </Link>
            </div>
          </div>

          {/* Columna Derecha: Ilustración Isométrica Minimalista y Sutil */}
          <div className="lg:col-span-5 flex items-center justify-center">
            <IsometricIllustration />
          </div>

        </div>
      </section>

      {/* =========================================================================
          Sección de Pilares del Proyecto con Micro-interacciones
          ========================================================================= */}
      <section className="space-y-8 text-left">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <IoSparklesOutline className="w-7 h-7 text-blue-600 dark:text-blue-400 animate-pulse" />
            Pilares Tecnológicos
          </h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm">
            Diseñado bajo una arquitectura de microservicios distribuida híbrida para garantizar escalabilidad, alto rendimiento y análisis inteligente.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Pilar 1: Catálogo Académico */}
          <Link to="/subjects" className="block group">
            <div className="h-full p-7 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:-translate-y-2 hover:shadow-xl dark:hover:shadow-[0_0_25px_rgba(46,81,156,0.2)] transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                  <IoBookOutline className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Catálogo de Materias
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Consulta materias interactivas integradas directamente con hilos y colas asíncronas para el guardado de progreso estudiantil inmediato.
                </p>
              </div>
              <div className="mt-6 flex items-center text-xs font-bold text-blue-600 dark:text-blue-400 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Ir al Catálogo <IoChevronForwardOutline className="w-3 h-3" />
              </div>
            </div>
          </Link>

          {/* Pilar 2: Tareas Concurrentes */}
          <Link to="/progress" className="block group">
            <div className="h-full p-7 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:-translate-y-2 hover:shadow-xl dark:hover:shadow-[0_0_25px_rgba(16,185,129,0.15)] transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                  <IoBarChartOutline className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Concurrencia en Hilos
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  La lógica backend en Spring Boot procesa el completado de tus recursos mediante hilos dedicados para un rendimiento sin bloqueos.
                </p>
              </div>
              <div className="mt-6 flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Ver mi Progreso <IoChevronForwardOutline className="w-3 h-3" />
              </div>
            </div>
          </Link>

          {/* Pilar 3: Recomendaciones AI */}
          <Link to="/recommendations" className="block group">
            <div className="h-full p-7 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:-translate-y-2 hover:shadow-xl dark:hover:shadow-[0_0_25px_rgba(99,102,241,0.18)] transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                  <IoSparklesOutline className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  Recomendación Inteligente
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  El motor en FastAPI (Python) analiza en tiempo real tu historial académico de lectura y emite sugerencias personalizadas instantáneas.
                </p>
              </div>
              <div className="mt-6 flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Ver Sugerencias <IoChevronForwardOutline className="w-3 h-3" />
              </div>
            </div>
          </Link>

        </div>
      </section>

    </div>
  )
}

export default HomePage;
