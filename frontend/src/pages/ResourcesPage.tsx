import { useEffect, useState } from "react";

type Resource = {
  id: number;
  title: string;
  type: string;
  completed: boolean;
};

function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);

  useEffect(() => {
    // Mock data temporal
    const mockResources: Resource[] = [
      {
        id: 1,
        title: "Introducción a RabbitMQ",
        type: "Video",
        completed: false,
      },
      {
        id: 2,
        title: "Guía de Docker para Microservicios",
        type: "PDF",
        completed: false,
      },
      {
        id: 3,
        title: "Arquitectura Distribuida",
        type: "Presentación",
        completed: true,
      },
    ];

    setResources(mockResources);
  }, []);

  const handleCompleteResource = async (resourceId: number) => {
  try {
    const studentId = 1;

    console.log(
      `POST /api/students/${studentId}/resources/${resourceId}/complete`
    );

    setResources((prevResources) =>
      prevResources.map((resource) =>
        resource.id === resourceId
          ? { ...resource, completed: true }
          : resource
      )
    );

    alert("Recurso marcado como completado");
  } catch (error) {
    console.error("Error al completar recurso:", error);
  }
};

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Recursos de Aprendizaje</h1>

      <p>
        Consulta y completa los recursos disponibles del curso seleccionado.
      </p>

      <div
        style={{
          display: "grid",
          gap: "1rem",
          marginTop: "2rem",
        }}
      >
        {resources.map((resource) => (
          <div
            key={resource.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "10px",
              padding: "1rem",
            }}
          >
            <h2>{resource.title}</h2>

            <p>
              <strong>Tipo:</strong> {resource.type}
            </p>

            <p>
              <strong>Estado:</strong>{" "}
              {resource.completed ? "Completado" : "Pendiente"}
            </p>

            <button
            onClick={() => handleCompleteResource(resource.id)}
            disabled={resource.completed}
          >
            {resource.completed
              ? "Recurso completado"
              : "Marcar como completado"}
          </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ResourcesPage;