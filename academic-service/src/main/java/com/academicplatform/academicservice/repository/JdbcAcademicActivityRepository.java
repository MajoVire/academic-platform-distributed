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
                    resource_id,
                    resource_title,
                    activity_type,
                    description,
                    thread_name,
                    completed_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                activity.studentId(),
                activity.resourceId(),
                activity.resourceTitle(),
                "RESOURCE_COMPLETED",
                String.format("Student %s completed resource '%s'", activity.studentId(), activity.resourceTitle()),
                activity.threadName(),
                activity.completedAt());
    }

    @Override
    public List<AcademicActivity> findAll() {
        return jdbcTemplate.query(
                """
                SELECT student_id, resource_id, resource_title, completed_at, thread_name
                FROM activity_log
                ORDER BY id ASC
                """,
                (rs, rowNum) -> new AcademicActivity(
                        rs.getLong("student_id"),
                        rs.getLong("resource_id"),
                        rs.getString("resource_title"),
                        rs.getObject("completed_at", java.time.LocalDateTime.class),
                        rs.getString("thread_name")));
    }
}
