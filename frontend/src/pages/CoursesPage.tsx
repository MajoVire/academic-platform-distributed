import { useEffect, useState } from "react";

type Course = {
  id: number;
  title: string;
  description: string;
  duration: string;
};

function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    // Mock data temporal
    const mockCourses: Course[] = [
      {
        id: 1,
        title: "Introducción a Microservicios",
        description:
          "Conceptos básicos de arquitecturas distribuidas y microservicios.",
        duration: "4 semanas",
      },
      {
        id: 2,
        title: "RabbitMQ y Sistemas de Colas",
        description:
          "Comunicación asíncrona entre servicios usando RabbitMQ.",
        duration: "3 semanas",
      },
      {
        id: 3,
        title: "Docker para Aplicaciones Backend",
        description:
          "Contenerización y despliegue de aplicaciones distribuidas.",
        duration: "5 semanas",
      },
    ];

    setCourses(mockCourses);
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Cursos Complementarios</h1>

      <p>
        Explora los cursos complementarios disponibles para la materia
        seleccionada.
      </p>

      <div
        style={{
          display: "grid",
          gap: "1rem",
          marginTop: "2rem",
        }}
      >
        {courses.map((course) => (
          <div
            key={course.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "10px",
              padding: "1rem",
            }}
          >
            <h2>{course.title}</h2>

            <p>{course.description}</p>

            <p>
              <strong>Duración:</strong> {course.duration}
            </p>

            <button>Ver recursos</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CoursesPage;