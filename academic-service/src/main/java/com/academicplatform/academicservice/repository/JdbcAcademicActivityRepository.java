package com.academicplatform.academicservice.repository;

import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.academicplatform.academicservice.model.AcademicActivity;

@Repository
@Profile("postgres")
public class JdbcAcademicActivityRepository implements AcademicActivityRepository {

    private final JdbcTemplate jdbcTemplate;

    public JdbcAcademicActivityRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void save(AcademicActivity activity) {
        jdbcTemplate.update(
                """
                INSERT INTO activity_log (
                    student_id,
                    action_type,
                    entity_type,
                    entity_id,
                    details,
                    created_at
                ) VALUES (?, ?, ?, ?, ?, ?)
                """,
                activity.studentId(),
                "RESOURCE_COMPLETED",
                "RESOURCE",
                activity.resourceId(),
                String.format(
                        "Student %s completed resource '%s' on thread %s",
                        activity.studentId(),
                        activity.resourceTitle(),
                        activity.threadName()),
                activity.completedAt());
    }

    @Override
    public List<AcademicActivity> findAll() {
        return jdbcTemplate.query(
                """
                SELECT student_id, entity_id, details, created_at, action_type
                FROM activity_log
                ORDER BY id ASC
                """,
                (rs, rowNum) -> new AcademicActivity(
                        rs.getLong("student_id"),
                        rs.getLong("entity_id"),
                        rs.getString("details"),
                        rs.getObject("created_at", java.time.LocalDateTime.class),
                        rs.getString("action_type")));
    }
}
