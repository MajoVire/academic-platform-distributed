package com.academicplatform.academicservice.controller;

import com.academicplatform.academicservice.service.EnrollmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    public EnrollmentController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    @PostMapping("/students/{studentId}/courses/{courseId}/enroll")
    public ResponseEntity<Void> enrollStudent(@PathVariable Long studentId, @PathVariable Long courseId) {
        enrollmentService.enrollStudent(studentId, courseId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/students/{studentId}/courses")
    public ResponseEntity<List<Long>> getEnrolledCourses(@PathVariable Long studentId) {
        List<Long> courses = enrollmentService.getEnrolledCoursesByStudent(studentId);
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/professors/{professorId}/students")
    public ResponseEntity<List<Long>> getStudentsByProfessor(@PathVariable Long professorId) {
        List<Long> studentIds = enrollmentService.getStudentsByProfessor(professorId);
        return ResponseEntity.ok(studentIds);
    }
}
