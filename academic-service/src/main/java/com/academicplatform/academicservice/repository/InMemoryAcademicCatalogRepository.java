package com.academicplatform.academicservice.repository;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Repository;

import com.academicplatform.academicservice.model.Course;
import com.academicplatform.academicservice.model.Resource;
import com.academicplatform.academicservice.model.Subject;

@Repository
public class InMemoryAcademicCatalogRepository implements AcademicCatalogRepository {

    private final Map<Long, Subject> subjects = new LinkedHashMap<>();
    private final Map<Long, Course> courses = new LinkedHashMap<>();
    private final Map<Long, Resource> resources = new LinkedHashMap<>();

    public InMemoryAcademicCatalogRepository() {
        loadSampleData();
    }

    @Override
    public List<Subject> findAllSubjects() {
        return List.copyOf(subjects.values());
    }

    @Override
    public Optional<Subject> findSubjectById(Long subjectId) {
        return Optional.ofNullable(subjects.get(subjectId));
    }

    @Override
    public List<Course> findCoursesBySubjectId(Long subjectId) {
        return courses.values().stream()
                .filter(course -> course.subjectId().equals(subjectId))
                .toList();
    }

    @Override
    public Optional<Course> findCourseById(Long courseId) {
        return Optional.ofNullable(courses.get(courseId));
    }

    @Override
    public List<Resource> findResourcesByCourseId(Long courseId) {
        return resources.values().stream()
                .filter(resource -> resource.courseId().equals(courseId))
                .toList();
    }

    @Override
    public Optional<Resource> findResourceById(Long resourceId) {
        return Optional.ofNullable(resources.get(resourceId));
    }

    private void loadSampleData() {
        Subject distributedSystems = new Subject(1L, "Sistemas Distribuidos", "Conceptos base de sistemas distribuidos y servicios");
        Subject softwareEngineering = new Subject(2L, "Ingenieria de Software", "Practicas de analisis, diseno y calidad");

        subjects.put(distributedSystems.id(), distributedSystems);
        subjects.put(softwareEngineering.id(), softwareEngineering);

        Course introDistributed = new Course(1L, 1L, "Introduccion a Sistemas Distribuidos", "Fundamentos, componentes y arquitectura");
        Course messagingSystems = new Course(2L, 1L, "Mensajeria y Colas", "Uso de colas, eventos y comunicacion asincrona");
        Course softwareDesign = new Course(3L, 2L, "Diseno de Software", "Principios de diseno y patrones comunes");

        courses.put(introDistributed.id(), introDistributed);
        courses.put(messagingSystems.id(), messagingSystems);
        courses.put(softwareDesign.id(), softwareDesign);

        resources.put(1L, new Resource(1L, 1L, "Introduccion a Docker", "Video y guia basica para contenedores", "video"));
        resources.put(2L, new Resource(2L, 1L, "Conceptos de concurrencia", "Lectura sobre procesos, hilos y sincronizacion", "reading"));
        resources.put(3L, new Resource(3L, 2L, "RabbitMQ para principiantes", "Material introductorio sobre colas de mensajeria", "article"));
        resources.put(4L, new Resource(4L, 2L, "Pub/Sub en la practica", "Ejercicios de publicacion y suscripcion", "exercise"));
        resources.put(5L, new Resource(5L, 3L, "Patrones de diseno esenciales", "Resumen de patrones utiles para proyectos", "reading"));
    }
}
