package com.academicplatform.academicservice.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;

import java.sql.SQLException;
import java.util.List;

import javax.sql.DataSource;

import org.junit.jupiter.api.Test;
import org.springframework.jdbc.BadSqlGrammarException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

class JdbcEnrollmentRepositoryTests {

    @Test
    void shouldReturnCourseIdsForStudentUsingExplicitRowMapping() {
        FakeJdbcTemplate jdbcTemplate = new FakeJdbcTemplate();
        jdbcTemplate.enrolledCourses = List.of(1L, 3L, 5L);

        JdbcEnrollmentRepository repository = new JdbcEnrollmentRepository(jdbcTemplate);

        assertEquals(List.of(1L, 3L, 5L), repository.getEnrolledCoursesByStudent(20253734L));
    }

    @Test
    void shouldReturnStudentIdsForProfessorUsingExplicitRowMapping() {
        FakeJdbcTemplate jdbcTemplate = new FakeJdbcTemplate();
        jdbcTemplate.studentsByProfessor = List.of(20253734L, 20250001L);

        JdbcEnrollmentRepository repository = new JdbcEnrollmentRepository(jdbcTemplate);

        assertEquals(List.of(20253734L, 20250001L), repository.getStudentsByProfessor(100L));
    }

    private static final class FakeJdbcTemplate extends JdbcTemplate {
        private List<Long> enrolledCourses = List.of();
        private List<Long> studentsByProfessor = List.of();

        private FakeJdbcTemplate() {
            super(mock(DataSource.class));
        }

        @Override
        public <T> List<T> query(String sql, RowMapper<T> rowMapper, Object... args) {
            if (sql.contains("SELECT e.course_id")) {
                return castList(enrolledCourses);
            }

            if (sql.contains("SELECT DISTINCT e.student_id")) {
                return castList(studentsByProfessor);
            }

            throw new AssertionError("Consulta inesperada: " + sql);
        }

        @SuppressWarnings("unchecked")
        private static <T> List<T> castList(List<?> values) {
            return (List<T>) values;
        }
    }
}
