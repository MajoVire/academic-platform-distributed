package com.academicplatform.academicservice.repository;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.academicplatform.academicservice.model.StudentProgress;

@Repository
@Profile("postgres")
public class JdbcStudentProgressRepository implements StudentProgressRepository {

    private final JdbcTemplate jdbcTemplate;

    public JdbcStudentProgressRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public StudentProgress getOrCreate(Long studentId) {
        return findByStudentId(studentId).orElseGet(() -> new StudentProgress(studentId));
    }

    @Override
    public Optional<StudentProgress> findByStudentId(Long studentId) {
        var rows = jdbcTemplate.query(
                """
                SELECT resource_id, completed_at
                FROM student_progress
                WHERE student_id = ?
                ORDER BY completed_at ASC, id ASC
                """,
                (rs, rowNum) -> new ProgressEntry(
                        rs.getLong("resource_id"),
                        rs.getObject("completed_at", LocalDateTime.class)),
                studentId);

        if (rows.isEmpty()) {
            return Optional.empty();
        }

        StudentProgress progress = new StudentProgress(studentId);
        rows.forEach(entry -> progress.markResourceCompleted(entry.resourceId(), entry.completedAt()));
        return Optional.of(progress);
    }

    @Override
    public boolean markResourceCompleted(Long studentId, Long resourceId, LocalDateTime completedAt) {
        return jdbcTemplate.update(
                """
                INSERT INTO student_progress (student_id, resource_id, completed_at)
                VALUES (?, ?, ?)
                ON CONFLICT (student_id, resource_id) DO NOTHING
                """,
                studentId,
                resourceId,
                completedAt) > 0;
    }

    private record ProgressEntry(Long resourceId, LocalDateTime completedAt) {
    }
}
