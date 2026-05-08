package com.academicplatform.academicservice.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.academicplatform.academicservice.dto.CourseResponse;
import com.academicplatform.academicservice.dto.ResourceResponse;
import com.academicplatform.academicservice.dto.SubjectResponse;
import com.academicplatform.academicservice.exception.CourseNotFoundException;
import com.academicplatform.academicservice.exception.SubjectNotFoundException;
import com.academicplatform.academicservice.model.Course;
import com.academicplatform.academicservice.model.Resource;
import com.academicplatform.academicservice.model.Subject;
import com.academicplatform.academicservice.exception.ResourceNotFoundException;
import com.academicplatform.academicservice.repository.AcademicCatalogRepository;

@Service
public class AcademicCatalogService {

    private final AcademicCatalogRepository academicCatalogRepository;

    public AcademicCatalogService(AcademicCatalogRepository academicCatalogRepository) {
        this.academicCatalogRepository = academicCatalogRepository;
    }

    public List<SubjectResponse> findAllSubjects() {
        return academicCatalogRepository.findAllSubjects()
                .stream()
                .map(SubjectResponse::from)
                .toList();
    }

    public List<CourseResponse> findCoursesBySubjectId(Long subjectId) {
        academicCatalogRepository.findSubjectById(subjectId)
                .orElseThrow(() -> new SubjectNotFoundException(subjectId));

        return academicCatalogRepository.findCoursesBySubjectId(subjectId)
                .stream()
                .map(CourseResponse::from)
                .toList();
    }

    public List<ResourceResponse> findResourcesByCourseId(Long courseId) {
        academicCatalogRepository.findCourseById(courseId)
                .orElseThrow(() -> new CourseNotFoundException(courseId));

        return academicCatalogRepository.findResourcesByCourseId(courseId)
                .stream()
                .map(ResourceResponse::from)
                .toList();
    }

    public Course findCourseEntityById(Long courseId) {
        return academicCatalogRepository.findCourseById(courseId)
                .orElseThrow(() -> new CourseNotFoundException(courseId));
    }

    public Subject findSubjectEntityById(Long subjectId) {
        return academicCatalogRepository.findSubjectById(subjectId)
                .orElseThrow(() -> new SubjectNotFoundException(subjectId));
    }

    public Resource findResourceEntityById(Long resourceId) {
        return academicCatalogRepository.findResourceById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException(resourceId));
    }
}
