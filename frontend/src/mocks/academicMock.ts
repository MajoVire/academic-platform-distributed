import type {
  Subject,
  Course,
  Resource,
  Progress,
  StudentRecommendationsResponse,
} from '../types/academic'

export const subjects: Subject[] = [
  { id: 1, name: 'Programación Web' },
  { id: 2, name: 'Bases de Datos' },
]

export const courses: Course[] = [
  { id: 1, subjectId: 1, title: 'React Básico' },
  { id: 2, subjectId: 1, title: 'TypeScript' },
]

export const resources: Resource[] = [
  {
    id: 1,
    courseId: 1,
    title: 'Introducción a React',
    type: 'video',
    url: 'https://example.com/react',
    completed: false,
  },
  {
    id: 2,
    courseId: 2,
    title: 'Guía de TypeScript',
    type: 'pdf',
    url: 'https://example.com/typescript',
    completed: true,
  },
]

export const progress: Progress = {
  studentId: 1,
  completedResources: 1,
  totalResources: 2,
  percentage: 50,
}

export const recommendations: StudentRecommendationsResponse = {
  studentId: 1,
  recommendations: [
    {
      title: 'Curso avanzado de React Hooks',
      reason: 'Porque completaste React Básico',
    },
  ],
}