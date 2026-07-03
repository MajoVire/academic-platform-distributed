package com.academicplatform.academicservice.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class JdbcEnrollmentRepository implements EnrollmentRepository {

    private final JdbcTemplate jdbcTemplate;

    public JdbcEnrollmentRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void enrollStudent(Long studentId, Long courseId) {
        if (isEnrolled(studentId, courseId)) {
            return;
        }
        String sql = "INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)";
        jdbcTemplate.update(sql, studentId, courseId);
    }

    @Override
    public boolean isEnrolled(Long studentId, Long courseId) {
        String sql = "SELECT count(*) FROM enrollments WHERE student_id = ? AND course_id = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, studentId, courseId);
        return count != null && count > 0;
    }

    @Override
    public List<Long> getStudentsByProfessor(Long professorId) {
        String sql = """
            SELECT DISTINCT e.student_id
            FROM enrollments e
            JOIN courses c ON e.course_id = c.id
            WHERE c.professor_id = ?
            ORDER BY e.student_id
        """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> rs.getLong("student_id"), professorId);
    }

    @Override
    public List<Long> getEnrolledCoursesByStudent(Long studentId) {
        String sql = """
            SELECT e.course_id
            FROM enrollments e
            WHERE e.student_id = ?
            ORDER BY e.enrolled_at ASC, e.id ASC
        """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> rs.getLong("course_id"), studentId);
    }
}
