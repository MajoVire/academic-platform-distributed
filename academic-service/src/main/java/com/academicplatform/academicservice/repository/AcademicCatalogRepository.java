package com.academicplatform.academicservice.repository;

import java.util.List;
import java.util.Optional;

import com.academicplatform.academicservice.model.Course;
import com.academicplatform.academicservice.model.Resource;
import com.academicplatform.academicservice.model.Subject;

public interface AcademicCatalogRepository {

    List<Subject> findAllSubjects();

    Optional<Subject> findSubjectById(Long subjectId);

    List<Course> findCoursesBySubjectId(Long subjectId);

    Optional<Course> findCourseById(Long courseId);

    List<Resource> findResourcesByCourseId(Long courseId);

    Optional<Resource> findResourceById(Long resourceId);

    long countAllResources();
}
