package com.academicplatform.academicservice.repository;

import java.util.Optional;

import com.academicplatform.academicservice.model.StudentProgress;

public interface StudentProgressRepository {

    StudentProgress getOrCreate(Long studentId);

    Optional<StudentProgress> findByStudentId(Long studentId);
}
