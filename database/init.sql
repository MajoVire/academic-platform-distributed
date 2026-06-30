CREATE DATABASE keycloak;

-- Catalogo academico
CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL
);

CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    subject_id INTEGER NOT NULL REFERENCES subjects(id),
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    UNIQUE(subject_id, title)
);

CREATE INDEX idx_courses_subject_id ON courses(subject_id);

CREATE TABLE resources (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id),
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    UNIQUE(course_id, title)
);

CREATE INDEX idx_resources_course_id ON resources(course_id);

-- Progreso de estudiantes
-- Una fila = un recurso completado por un estudiante

CREATE TABLE student_progress (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    resource_id INTEGER NOT NULL REFERENCES resources(id),
    completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, resource_id)
);

CREATE INDEX idx_student_progress_student_id ON student_progress(student_id);
CREATE INDEX idx_student_progress_resource_id ON student_progress(resource_id);

-- Bitacora de actividad academica

CREATE TABLE activity_log (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    resource_id INTEGER NOT NULL REFERENCES resources(id),
    resource_title VARCHAR(150) NOT NULL,
    activity_type VARCHAR(100) NOT NULL DEFAULT 'RESOURCE_COMPLETED',
    description TEXT NOT NULL,
    thread_name VARCHAR(100) NOT NULL,
    completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_log_student_id ON activity_log(student_id);
CREATE INDEX idx_activity_log_resource_id ON activity_log(resource_id);
CREATE INDEX idx_activity_log_completed_at ON activity_log(completed_at);

-- Datos iniciales del catalogo

INSERT INTO subjects (id, name, description) VALUES
(1, 'Sistemas Distribuidos', 'Conceptos base de sistemas distribuidos y servicios'),
(2, 'Ingenieria de Software', 'Practicas de analisis, diseno y calidad'),
(3, 'BASE DE DATOS II: ADMINISTRACIÓN Y OPTIMIZACIÓN', 'Administración avanzada de bases de datos y optimización de consultas'),
(4, 'GESTION DE PROYECTOS', 'Metodologías ágiles y tradicionales para la gestión de proyectos de TI'),
(5, 'INTELIGENCIA ARTIFICIAL', 'Fundamentos de IA, machine learning y redes neuronales'),
(6, 'SISTEMAS OPERATIVOS', 'Arquitectura, gestión de memoria y procesos de sistemas operativos'),
(7, 'INGENIERIA DE REQUERIMIENTOS', 'Técnicas de elicitación, análisis y especificación de requerimientos'),
(8, 'INGENIERÍA DE SOFTWARE EMPÍRICA', 'Estudio basado en datos y métricas aplicadas al desarrollo de software'),
(9, 'REDES DE COMPUTADORES', 'Protocolos, arquitecturas y topologías de redes informáticas'),
(10, 'SEGURIDAD INFORMÁTICA', 'Principios de criptografía, vulnerabilidades y protección de sistemas'),
(11, 'VERIFICACION Y VALIDACION DE SOFTWARE', 'Pruebas de software, aseguramiento de la calidad y testing automatizado'),
(12, 'DISEÑO Y ARQUITECTURA DE SOFTWARE', 'Patrones de diseño arquitectónico y modelado de sistemas complejos'),
(13, 'INTERACCIÓN HUMANO-MÁQUINA', 'Diseño de interfaces, experiencia de usuario y usabilidad'),
(14, 'PROGRAMACIÓN WEB', 'Desarrollo de aplicaciones web frontend y backend'),
(15, 'TECNOLOGIAS PARA LA EDUCACION', 'Herramientas digitales y plataformas para el e-learning y educación virtual');

SELECT setval('subjects_id_seq', (SELECT MAX(id) FROM subjects));

INSERT INTO courses (id, subject_id, title, description) VALUES
(1, 1, 'Introduccion a Sistemas Distribuidos', 'Fundamentos, componentes y arquitectura'),
(2, 1, 'Mensajeria y Colas', 'Uso de colas, eventos y comunicacion asincronica'),
(3, 2, 'Diseno de Software', 'Principios de diseno y patrones comunes'),
(4, 3, 'Afinamiento de Consultas SQL', 'Técnicas avanzadas para mejorar el rendimiento de BD'),
(5, 3, 'Respaldos y Alta Disponibilidad', 'Estrategias de backup y replicación de datos'),
(6, 4, 'Metodología Scrum en la Práctica', 'Gestión de proyectos usando sprints y ceremonias'),
(7, 5, 'Redes Neuronales desde Cero', 'Introducción matemática y práctica al deep learning'),
(8, 5, 'Procesamiento de Lenguaje Natural', 'Análisis de texto y modelos de lenguaje NLP'),
(9, 6, 'Gestión de Memoria y Paginación', 'Cómo el SO administra la memoria RAM'),
(10, 7, 'Historias de Usuario y Casos de Uso', 'Técnicas para especificar requerimientos funcionales'),
(11, 8, 'Métricas de Calidad de Software', 'Cómo medir el éxito y la calidad en el desarrollo'),
(12, 9, 'Capa de Red y Enrutamiento IP', 'Estudio de los protocolos de red e IPs'),
(13, 10, 'Ataques Web Comunes (OWASP)', 'Inyección SQL, XSS y protección de APIs'),
(14, 11, 'Pruebas Unitarias y TDD', 'Desarrollo guiado por pruebas usando frameworks'),
(15, 12, 'Arquitectura de Microservicios', 'Desacoplamiento y escalabilidad de servicios'),
(16, 12, 'Patrones de Diseño Gang of Four', 'Creacionales, estructurales y de comportamiento'),
(17, 13, 'Principios de UX/UI', 'Bases de la experiencia de usuario y diseño visual'),
(18, 14, 'Desarrollo Frontend React Avanzado', 'Hooks, estado global y optimización en React'),
(19, 14, 'Backend API REST con Spring Boot', 'Creación de servicios web y conexión a BD'),
(20, 15, 'Gamificación en el Aula Virtual', 'Uso de juegos y recompensas para el aprendizaje');

SELECT setval('courses_id_seq', (SELECT MAX(id) FROM courses));

INSERT INTO resources (id, course_id, title, description, type) VALUES
(1, 1, 'Introduccion a Docker', 'Video y guia basica para contenedores', 'video'),
(2, 1, 'Conceptos de concurrencia', 'Lectura sobre procesos, hilos y sincronizacion', 'reading'),
(3, 2, 'RabbitMQ para principiantes', 'Material introductorio sobre colas de mensajeria', 'article'),
(4, 2, 'Pub/Sub en la practica', 'Ejercicios de publicacion y suscripcion', 'exercise'),
(5, 3, 'Patrones de diseno esenciales', 'Resumen de patrones utiles para proyectos', 'reading'),
(6, 4, 'Índices B-Tree vs Hash', 'Lectura sobre estructuras de índices', 'reading'),
(7, 5, 'Configurando replicación en PostgreSQL', 'Tutorial paso a paso', 'video'),
(8, 6, 'Ceremonias de Scrum', 'Video sobre daily, planning, review y retro', 'video'),
(9, 7, 'Backpropagation explicado', 'Artículo con derivadas y matrices', 'article'),
(10, 8, 'Uso de la librería Transformers', 'Ejercicio práctico en Python', 'exercise'),
(11, 9, 'Simulador de Memoria Virtual', 'Laboratorio interactivo de SO', 'exercise'),
(12, 10, 'Plantilla de Especificación de Requerimientos', 'Documento descargable IEEE', 'reading'),
(13, 11, 'Calculando la Deuda Técnica', 'Lectura de métricas empíricas', 'reading'),
(14, 12, 'Análisis con Wireshark', 'Práctica de intercepción de paquetes', 'exercise'),
(15, 13, 'Cómo prevenir SQL Injection', 'Guía y ejemplos de código seguro', 'article'),
(16, 14, 'Introducción a JUnit y Mockito', 'Video sobre tests en Java', 'video'),
(17, 15, 'Comunicación entre Microservicios', 'Lectura sobre REST vs gRPC', 'reading'),
(18, 16, 'Patrón Singleton y Factory', 'Ejemplos de código', 'reading'),
(19, 17, 'Leyes de la usabilidad (Fitts, Hick)', 'Video sobre psicología cognitiva', 'video'),
(20, 18, 'Gestión de estado con Context API', 'Tutorial interactivo de React', 'exercise'),
(21, 19, 'Seguridad con JWT en Spring', 'Video explicativo de OAuth2', 'video'),
(22, 20, 'Estrategias de motivación en línea', 'Lectura sobre engagement estudiantil', 'article');

SELECT setval('resources_id_seq', (SELECT MAX(id) FROM resources));
