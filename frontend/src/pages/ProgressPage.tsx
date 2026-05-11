import { useEffect, useState } from "react";

type Progress = {
  totalResources: number;
  completedResources: number;
  percentage: number;
};

function ProgressPage() {
  const [progress, setProgress] = useState<Progress | null>(null);

  useEffect(() => {
    // Mock data temporal
    const mockProgress: Progress = {
      totalResources: 10,
      completedResources: 7,
      percentage: 70,
    };

    setProgress(mockProgress);
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Progreso del Estudiante</h1>

      <p>
        Consulta el avance actual del estudiante dentro de los cursos
        académicos.
      </p>

      {progress && (
        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: "10px",
            padding: "1.5rem",
            marginTop: "2rem",
            maxWidth: "500px",
          }}
        >
          <h2>Resumen de progreso</h2>

          <p>
            <strong>Total de recursos:</strong>{" "}
            {progress.totalResources}
          </p>

          <p>
            <strong>Recursos completados:</strong>{" "}
            {progress.completedResources}
          </p>

          <p>
            <strong>Porcentaje completado:</strong>{" "}
            {progress.percentage}%
          </p>

          <div
            style={{
              width: "100%",
              height: "20px",
              backgroundColor: "#e5e5e5",
              borderRadius: "10px",
              overflow: "hidden",
              marginTop: "1rem",
            }}
          >
            <div
              style={{
                width: `${progress.percentage}%`,
                height: "100%",
                backgroundColor: "#4caf50",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ProgressPage;