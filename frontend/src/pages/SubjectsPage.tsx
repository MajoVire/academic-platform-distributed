import { useEffect, useState } from "react";

type Subject = {
  id: number;
  name: string;
  description: string;
};

function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    // Mock data temporal
    const mockSubjects: Subject[] = [
      {
        id: 1,
        name: "Programación Web",
        description: "Desarrollo de aplicaciones web modernas",
      },
      {
        id: 2,
        name: "Sistemas Distribuidos",
        description: "Arquitecturas distribuidas y microservicios",
      },
      {
        id: 3,
        name: "Inteligencia Artificial",
        description: "Algoritmos y modelos de aprendizaje",
      },
    ];

    setSubjects(mockSubjects);
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Materias Disponibles</h1>

      <p>
        Consulta las materias académicas disponibles dentro de la plataforma.
      </p>

      <div
        style={{
          display: "grid",
          gap: "1rem",
          marginTop: "2rem",
        }}
      >
        {subjects.map((subject) => (
          <div
            key={subject.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "10px",
              padding: "1rem",
            }}
          >
            <h2>{subject.name}</h2>

            <p>{subject.description}</p>

            <button>Ver cursos</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SubjectsPage;