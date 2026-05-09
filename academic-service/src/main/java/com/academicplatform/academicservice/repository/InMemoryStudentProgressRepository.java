package com.academicplatform.academicservice.repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import org.springframework.stereotype.Repository;
import org.springframework.context.annotation.Profile;

import com.academicplatform.academicservice.model.StudentProgress;

@Repository
@Profile("!postgres")
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

    @Override
    public boolean markResourceCompleted(Long studentId, Long resourceId, LocalDateTime completedAt) {
        StudentProgress progress = studentProgressByStudentId.computeIfAbsent(studentId, StudentProgress::new);
        return progress.markResourceCompleted(resourceId, completedAt);
    }
}
