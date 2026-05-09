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
(2, 'Ingenieria de Software', 'Practicas de analisis, diseno y calidad');

INSERT INTO courses (id, subject_id, title, description) VALUES
(1, 1, 'Introduccion a Sistemas Distribuidos', 'Fundamentos, componentes y arquitectura'),
(2, 1, 'Mensajeria y Colas', 'Uso de colas, eventos y comunicacion asincronica'),
(3, 2, 'Diseno de Software', 'Principios de diseno y patrones comunes');

INSERT INTO resources (id, course_id, title, description, type) VALUES
(1, 1, 'Introduccion a Docker', 'Video y guia basica para contenedores', 'video'),
(2, 1, 'Conceptos de concurrencia', 'Lectura sobre procesos, hilos y sincronizacion', 'reading'),
(3, 2, 'RabbitMQ para principiantes', 'Material introductorio sobre colas de mensajeria', 'article'),
(4, 2, 'Pub/Sub en la practica', 'Ejercicios de publicacion y suscripcion', 'exercise'),
(5, 3, 'Patrones de diseno esenciales', 'Resumen de patrones utiles para proyectos', 'reading');
