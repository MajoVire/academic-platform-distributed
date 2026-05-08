package com.academicplatform.academicservice.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class InMemoryAcademicCatalogRepositoryTests {

    private final InMemoryAcademicCatalogRepository repository = new InMemoryAcademicCatalogRepository();

    @Test
    void shouldLoadSubjectsCoursesAndResources() {
        assertEquals(2, repository.findAllSubjects().size());
        assertEquals(2, repository.findCoursesBySubjectId(1L).size());
        assertEquals(2, repository.findResourcesByCourseId(1L).size());
        assertTrue(repository.findResourceById(3L).isPresent());
    }
}
