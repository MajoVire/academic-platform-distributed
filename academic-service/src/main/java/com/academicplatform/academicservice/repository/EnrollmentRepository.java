package com.academicplatform.academicservice.repository;

import java.util.List;

public interface EnrollmentRepository {
    void enrollStudent(Long studentId, Long courseId);
    boolean isEnrolled(Long studentId, Long courseId);
    List<Long> getStudentsByProfessor(Long professorId);
    List<Long> getEnrolledCoursesByStudent(Long studentId);
}
