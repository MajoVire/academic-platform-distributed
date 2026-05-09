package com.academicplatform.academicservice.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.academicplatform.academicservice.dto.StudentProgressResponse;
import com.academicplatform.academicservice.service.StudentProgressService;

@RestController
@RequestMapping("/api/students")
public class StudentProgressController {

    private final StudentProgressService studentProgressService;

    public StudentProgressController(StudentProgressService studentProgressService) {
        this.studentProgressService = studentProgressService;
    }

    @GetMapping("/{studentId}/progress")
    public StudentProgressResponse getProgress(@PathVariable Long studentId) {
        return studentProgressService.findProgressByStudentId(studentId);
    }
}
