# 🎓 Plataforma Académica: Arquitectura Frontend y Diseño Responsivo

Este módulo constituye la interfaz de usuario de la **Plataforma Académica Distribuida**, una aplicación web moderna, interactiva y responsiva. 

1. **Tecnología Frontend de Vanguardia** (React, Vite, TypeScript)
2. **Estilo Integrado Avanzado** (Tailwind CSS v4 + Glassmorphism + Ilustraciones Vectoriales)
3. **Comunicación de Red Asíncrona** (Axios, Proxy de API, Fallback Mocks)
4. **Diseño Mobile-First & Responsive UX** (Menú PWA nativo, Grids Fluidos)

---

## 🎯 Acceso Directo al Código 

| Requerimiento Evaluado | Archivo de Código | Líneas Destacadas / Propósito |
| :--- | :--- | :--- |
| **Tipado Estático con TypeScript** | 📄 [src/types/academic.ts](file:///c:/Users/USUARIO/academic-platform-distributed/frontend/src/types/academic.ts) | Definición estricta de interfaces (`Subject`, `Course`, `Resource`, `Progress`). |
| **Configuración de Tailwind v4** | 📄 [vite.config.ts#L3-L9](file:///c:/Users/USUARIO/academic-platform-distributed/frontend/vite.config.ts#L3-L9) | Integración oficial de `@tailwindcss/vite` como plugin nativo en el build pipeline. |
| **Personalización de Tema & Dark Mode** | 📄 [src/index.css#L1-L25](file:///c:/Users/USUARIO/academic-platform-distributed/frontend/src/index.css#L1-L25) | Sobrescritura del tema global de colores (Paleta Denim) y variante personalizada para Dark Mode. |
| **Estructura e Interfaces Isométricas** | 📄 [src/pages/HomePage.tsx#L14-L159](file:///c:/Users/USUARIO/academic-platform-distributed/frontend/src/pages/HomePage.tsx#L14-L159) | Ilustraciones isométricas dinámicas embebidas directamente como código de componentes SVG. |
| **Estado y Ciclo de Vida de React** | 📄 [src/pages/ResourcesPage.tsx#L33-L90](file:///c:/Users/USUARIO/academic-platform-distributed/frontend/src/pages/ResourcesPage.tsx#L33-L90) | Uso avanzado de `useState`, `useEffect` y peticiones asíncronas para el manejo de recursos. |
| **Rutas Dinámicas & Parámetros** | 📄 [src/pages/ResourcesPage.tsx#L34-L44](file:///c:/Users/USUARIO/academic-platform-distributed/frontend/src/pages/ResourcesPage.tsx#L34-L44) | Enrutamiento con React Router 7 usando parámetros de URL (`useParams<{ courseId }>()`). |
| **Cliente de Comunicación Axios** | 📄 [src/api/apiClient.ts#L1-L8](file:///c:/Users/USUARIO/academic-platform-distributed/frontend/src/api/apiClient.ts#L1-L8) | Instancia centralizada de Axios con base URL dinámica e interceptores de cabeceras. |
| **Capa de Abstracción de Red** | 📄 [src/api/academicApi.ts#L10-L54](file:///c:/Users/USUARIO/academic-platform-distributed/frontend/src/api/academicApi.ts#L10-L54) | Llamadas tipadas a los servicios distribuidos (`getSubjects`, `completeResource`, etc.). |
| **Resiliencia y Datos Mock** | 📄 [src/mocks/academicMock.ts#L1-L53](file:///c:/Users/USUARIO/academic-platform-distributed/frontend/src/mocks/academicMock.ts#L1-L53) | Base de datos mock de respaldo para garantizar funcionamiento visual sin servicios externos. |
| **Estructura Mobile-First (Navbar)** | 📄 [src/components/ui/Navbar.tsx#L52-L163](file:///c:/Users/USUARIO/academic-platform-distributed/frontend/src/components/ui/Navbar.tsx#L52-L163) | Distribución de doble barra: barra fija para escritorio y barra inferior estilo App (PWA) para móvil. |
| **Grillas Responsivas Dinámicas** | 📄 [src/pages/ResourcesPage.tsx#L154-L180](file:///c:/Users/USUARIO/academic-platform-distributed/frontend/src/pages/ResourcesPage.tsx#L154-L180) | Uso de retículas adaptativas (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`). |

---

## 💻 1. Explicación Técnica de las Tecnologías Implementadas

### A. Tecnología Frontend: React 19 + TypeScript + Vite 8
La aplicación aprovecha las máximas ventajas de un ecosistema de desarrollo de software profesional:
* **Enrutamiento Declarativo:** Implementado mediante `react-router` para proveer navegación instantánea sin refresco de página de tipo SPA (Single Page Application).
* **Manejo Reactivo del Estado:** En lugar de manipular el HTML de forma manual (como en JQuery o JS vainilla), el estado visual se sincroniza de forma declarativa con `useState`. Cuando los datos del backend llegan, la UI se actualiza inmediatamente por reconciliación del DOM virtual.
* **Tipado de Datos Seguro:** TypeScript valida en tiempo de diseño que cada componente reciba exactamente las propiedades y formatos de objeto correctos, disminuyendo a cero los errores comunes de "undefined" en producción.

**Ejemplo de flujo reactivo (Carga de materias):**
```tsx
export function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSubjects().then(data => {
      setSubjects(data)
      setLoading(false)
    })
  }, [])

  if (loading) return <Loader />

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {subjects.map(subject => <SubjectCard key={subject.id} {...subject} />)}
    </div>
  )
}
```

## API Gateway en desarrollo

El frontend consume el backend a través de `web-gateway-service`.

Variables útiles:

- `VITE_API_BASE_URL=http://localhost:3000`

En desarrollo, Vite también reenvía `/api` hacia `http://localhost:3000`.

---

### B. Diseño Estético y Sistema de Estilos: Tailwind CSS v4
Nos basamos en **Tailwind CSS v4** integrado directamente mediante el plugin del compilador nativo de Vite. Esto nos permite un rendimiento de compilación de CSS en milisegundos y un uso de utilidades moderno y modular.

* **Fondo de Cristal (Glassmorphism):** Un look de interfaz premium utilizando opacidad del 80% con filtros de desenfoque de fondo y bordes muy finos.
  ```tsx
  className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/80"
  ```
* **Personalización del Tema:** Extendimos la paleta de colores de Tailwind en [index.css](file:///c:/Users/USUARIO/academic-platform-distributed/frontend/src/index.css#L9-L25) con un tono de azul Denim Corporativo suave para lograr una identidad elegante y formal:
  ```css
  @theme {
    --color-blue-500: #426fc0; /* Azul principal suave */
    --color-blue-600: #2e519c; /* Azul corporativo académico distinguido */
  }
  ```
* **Ilustraciones vectoriales dinámicas en JSX:**
  Para un diseño impecable, las pantallas incorporan dibujos isométricos en formato SVG que escalan sin perder definición en ninguna resolución de pantalla.

---

### C. Comunicación con Backend (Servicio Real y Fallback de Mocks)
La interfaz se comunica con múltiples servidores que forman el sistema distribuido:
1. **API Gateway (Node.js + Express, Puerto 3000)** como entrada principal desde el frontend hacia los servicios internos.
2. **Servicios Académicos (API Spring Boot, Puerto 8080)** para consultar el listado de cursos, materias y registrar el completado de recursos.
2. **Servicios de Recomendación (API FastAPI, Puerto 8000)** para mostrar sugerencias inteligentes en tiempo real según el progreso.

**Configuración del API Proxy (`vite.config.ts`):**
```typescript
server: {
  proxy: {
     '/api': {
       target: 'http://localhost:3000', // Redirige al API Gateway para evitar errores CORS
       changeOrigin: true,
     }
  }
}
```

**Mecanismo de Resiliencia (Mocking de Respaldo):**
Si se ejecuta el frontend sin tener encendidos los contenedores de Docker o los servicios del backend en segundo plano, el sistema puede capturar los errores de red de manera elegante y ofrecer datos mock localizados en [src/mocks/academicMock.ts](file:///c:/Users/USUARIO/academic-platform-distributed/frontend/src/mocks/academicMock.ts), garantizando que la plataforma pueda ser evaluada visualmente en cualquier escenario sin fallos críticos de pantalla en blanco.

---

### D. Enfoque Responsivo Mobile-First
El diseño de la aplicación garantiza una experiencia inmejorable en dispositivos móviles aplicando principios modernos de diseño responsive:

* **Estructura de Menú Móvil Adaptativo (Estilo Aplicación Nativa):**
  * **En móviles (< 768px):** El menú superior horizontal tradicional se oculta (`hidden md:block`). En su lugar, el sistema renderiza un **Navbar Fijo Inferior con Iconos Grandes** (estilo pestañas móviles de Instagram o Twitter) que facilita el toque con el pulgar.
  * **En escritorio (>= 768px):** La barra inferior se oculta (`md:hidden`) y se muestra una cabecera con el logotipo y enlaces distribuidos horizontalmente.
* **Ocultamiento de Elementos Complejos:** En pantallas pequeñas, se ocultan ilustraciones SVGs accesorias (`hidden sm:block`) para concentrar la atención del estudiante en el contenido importante y evitar que tenga que hacer un scroll infinito vertical.
* **Reorganización Dinámica de Columnas:** Las tarjetas se ajustan de una columna en móvil, dos en tablets y tres en desktops empleando el sistema de rejillas fluidas de CSS Grid.
---

## 🗺️ 2. Estructura del Frontend 

### Detalle de Archivos, Contenido y Cumplimiento de Requisitos

Aquí se explica qué hace cada archivo del proyecto y qué requisito específico cumple:

#### 1. Capa de Configuración y Arranque
* **`vite.config.ts`**:
  * **Contiene:** Configuración del compilador de Vite, plugin oficial de Tailwind CSS v4, plugin de PWA y proxies de reenvío de red (`/api` redirigido a `localhost:3000` por defecto).
  * **Cumple con:** *Requisito 2 (CSS Integrado)* al activar el motor compilador de Tailwind, y *Requisito 3 (Conexión Backend)* al evadir los problemas de seguridad CORS mediante proxies locales.
* **`src/index.css`**:
  * **Contiene:** Directivas de Tailwind CSS, personalizaciones de la paleta de colores global (Tema Denim) y variantes manuales para el soporte de Modo Oscuro (`.dark`).
  * **Cumple con:** *Requisito 2 (CSS Integrado)* proveyendo la base estética estilizada unificada del proyecto.
* **`src/main.tsx` y `src/App.tsx`**:
  * **Contiene:** Inicialización de React 19, montaje en el DOM de HTML, y definición del árbol de enrutamiento dinámico (`react-router`).
  * **Cumple con:** *Requisito 1 (Tecnología Front)* sirviendo de base funcional para la ejecución SPA de la aplicación.

#### 2. Capa de Datos y Tipado
* **`src/types/academic.ts`**:
  * **Contiene:** Definición de contratos y esquemas estáticos (`Subject`, `Course`, `Resource`, `Progress`) requeridos para la consistencia de datos de la plataforma.
  * **Cumple con:** *Requisito 1 (Tecnología Front - TypeScript)* aportando tipado seguro en toda la aplicación.

#### 3. Capa de Comunicación con el Servidor
* **`src/api/apiClient.ts`**:
  * **Contiene:** Instancia de Axios global configurada con la variable de entorno `VITE_API_BASE_URL` y las cabeceras predeterminadas de JSON.
  * **Cumple con:** *Requisito 3 (Conexión Backend)* proveyendo la base física para las peticiones HTTP asíncronas.
* **`src/api/academicApi.ts`**:
  * **Contiene:** Funciones asíncronas de red (`getSubjects`, `getSubjectCourses`, `completeResource`, etc.) que retornan promesas fuertemente tipadas de TypeScript.
  * **Cumple con:** *Requisito 3 (Conexión Backend)* abstrayendo los accesos de red del diseño visual.
* **`src/mocks/academicMock.ts`**:
  * **Contiene:** Datos duros estructurados idénticos a los del backend para materias, cursos y recursos de simulación.
  * **Cumple con:** *Requisito 3 (Conexión Backend)* al actuar como un mecanismo de resiliencia (Mock Fallback) que entra en funcionamiento automáticamente si el servidor real no responde, permitiendo evaluar la interfaz visual al 100%.

#### 4. Capa de Componentes de Interfaz de Usuario
* **`src/components/ui/Navbar.tsx`**:
  * **Contiene:** Componente doble de barra de navegación. Dispone de una cabecera para escritorio (`hidden md:block`) y una barra de pestañas fijas en el borde inferior para móvil (`md:hidden`) emulando una aplicación nativa.
  * **Cumple con:** *Requisito 4 (Diseño Responsivo Mobile-First)* al reestructurar por completo la interfaz de navegación al cambiar la anchura de la pantalla.
* **`src/components/ui/ProgressCircle.tsx`**:
  * **Contiene:** Componente interactivo que dibuja mediante fórmulas matemáticas de SVG un anillo animado con el porcentaje exacto de progreso del estudiante.
  * **Cumple con:** *Requisito 2 (CSS Integrado)* utilizando Tailwind para animar e iluminar el anillo en modo claro y oscuro de manera limpia.

#### 5. Capa de Pantallas (Contenedores)
* **`src/pages/HomePage.tsx`**:
  * **Contiene:** Banner Hero de bienvenida, botones de navegación directa y una ilustración isométrica compleja interactiva modelada íntegramente en SVG.
  * **Cumple con:** *Requisito 4 (Diseño Responsivo)* al reorganizar las columnas y ocultar gráficos complejos en móviles para agilizar la lectura, y *Requisito 2 (CSS)* por las clases de gradientes y resplandores.
* **`src/pages/SubjectsPage.tsx`**:
  * **Contiene:** Ciclo de vida para consumir `/api/subjects` de forma asíncrona y pintar en pantalla las materias disponibles.
  * **Cumple con:** *Requisito 1 (React State)* mediante hooks `useState` y `useEffect`, y *Requisito 4 (Responsivo)* al utilizar rejillas fluidas (`grid`).
* **`src/pages/ResourcesPage.tsx`**:
  * **Contiene:** Pantalla interactiva que permite ver qué recursos de un curso ha completado el estudiante y marcar nuevos como completados de manera asíncrona.
  * **Cumple con:** *Requisito 1 (React Hooks)* y *Requisito 3 (Backend)* al enviar los reportes de progreso al backend distribuidor de forma instantánea.

---

## 🚀 Instrucciones de Ejecución Local

Para ejecutar la aplicación localmente y ver el sistema de estilos en acción:

1. Asegúrate de estar dentro de la carpeta del frontend:
   ```bash
   cd frontend
   ```
2. Instala las dependencias necesarias:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo local de Vite:
   ```bash
   npm run dev
   ```
4. Abre la dirección indicada en tu navegador (usualmente **`http://localhost:5173`**).
