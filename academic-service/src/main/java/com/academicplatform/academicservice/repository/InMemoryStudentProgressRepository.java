package com.academicplatform.academicservice.repository;

import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import org.springframework.stereotype.Repository;

import com.academicplatform.academicservice.model.StudentProgress;

@Repository
public class InMemoryStudentProgressRepository implements StudentProgressRepository {

    private final ConcurrentMap<Long, StudentProgress> studentProgressByStudentId = new ConcurrentHashMap<>();

    @Override
    public StudentProgress getOrCreate(Long studentId) {
        return studentProgressByStudentId.computeIfAbsent(studentId, StudentProgress::new);
    }

    @Override
    public Optional<StudentProgress> findByStudentId(Long studentId) {
        return Optional.ofNullable(studentProgressByStudentId.get(studentId));
    }
}
