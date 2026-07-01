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
        """;
        return jdbcTemplate.queryForList(sql, Long.class, professorId);
    }

    @Override
    public List<Long> getEnrolledCoursesByStudent(Long studentId) {
        String sql = "SELECT course_id FROM enrollments WHERE student_id = ?";
        return jdbcTemplate.queryForList(sql, Long.class, studentId);
    }
}
