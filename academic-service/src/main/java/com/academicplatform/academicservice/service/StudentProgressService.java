package com.academicplatform.academicservice.service;

import org.springframework.stereotype.Service;

import com.academicplatform.academicservice.dto.StudentProgressResponse;
import com.academicplatform.academicservice.model.StudentProgress;
import com.academicplatform.academicservice.repository.StudentProgressRepository;

@Service
public class StudentProgressService {

    private final StudentProgressRepository studentProgressRepository;

    public StudentProgressService(StudentProgressRepository studentProgressRepository) {
        this.studentProgressRepository = studentProgressRepository;
    }

    public StudentProgressResponse findProgressByStudentId(Long studentId) {
        StudentProgress progress = studentProgressRepository.findByStudentId(studentId)
                .orElseGet(() -> new StudentProgress(studentId));
        return StudentProgressResponse.from(progress);
    }
}
