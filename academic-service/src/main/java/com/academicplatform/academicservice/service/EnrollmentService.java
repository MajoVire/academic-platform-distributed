package com.academicplatform.academicservice.service;

import com.academicplatform.academicservice.repository.EnrollmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;

    public EnrollmentService(EnrollmentRepository enrollmentRepository) {
        this.enrollmentRepository = enrollmentRepository;
    }

    @Transactional
    public void enrollStudent(Long studentId, Long courseId) {
        enrollmentRepository.enrollStudent(studentId, courseId);
    }

    public List<Long> getStudentsByProfessor(Long professorId) {
        return enrollmentRepository.getStudentsByProfessor(professorId);
    }

    public List<Long> getEnrolledCoursesByStudent(Long studentId) {
        return enrollmentRepository.getEnrolledCoursesByStudent(studentId);
    }
}
