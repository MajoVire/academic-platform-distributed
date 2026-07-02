package com.academicplatform.academicservice.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;

import java.sql.SQLException;
import java.util.List;

import javax.sql.DataSource;

import org.junit.jupiter.api.Test;
import org.springframework.jdbc.BadSqlGrammarException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

import com.academicplatform.academicservice.model.Course;

class JdbcAcademicCatalogRepositoryTests {

    @Test
    void shouldFallbackToLegacyNameColumnWhenTitleColumnIsMissing() {
        FakeJdbcTemplate jdbcTemplate = new FakeJdbcTemplate();
        jdbcTemplate.coursesBySubject = List.of(
                new Course(1L, 1L, "Introduccion a Sistemas Distribuidos", "Fundamentos, componentes y arquitectura"));
        jdbcTemplate.courseById = new Course(1L, 1L, "Introduccion a Sistemas Distribuidos", "Fundamentos, componentes y arquitectura");

        JdbcAcademicCatalogRepository repository = new JdbcAcademicCatalogRepository(jdbcTemplate);

        List<Course> courses = repository.findCoursesBySubjectId(1L);
        assertEquals(1, courses.size());
        assertEquals("Introduccion a Sistemas Distribuidos", courses.get(0).title());

        assertTrue(repository.findCourseById(1L).isPresent());
        assertEquals(
                "Introduccion a Sistemas Distribuidos",
                repository.findCourseById(1L).orElseThrow().title());
    }

    private static final class FakeJdbcTemplate extends JdbcTemplate {
        private List<Course> coursesBySubject = List.of();
        private Course courseById;

        private FakeJdbcTemplate() {
            super(mock(DataSource.class));
        }

        @Override
        public <T> List<T> query(String sql, RowMapper<T> rowMapper, Object... args) {
            if (sql.contains("title AS title")) {
                throw missingTitleColumnException(sql);
            }

            if (sql.contains("name AS title") && sql.contains("WHERE subject_id = ?")) {
                return castList(coursesBySubject);
            }

            if (sql.contains("name AS title") && sql.contains("WHERE id = ?")) {
                return castList(courseById == null ? List.of() : List.of(courseById));
            }

            throw new AssertionError("Consulta inesperada: " + sql);
        }

        private static BadSqlGrammarException missingTitleColumnException(String sql) {
            return new BadSqlGrammarException(
                    "query courses",
                    sql,
                    new SQLException("column \"title\" does not exist"));
        }

        @SuppressWarnings("unchecked")
        private static <T> List<T> castList(List<?> values) {
            return (List<T>) values;
        }
    }
}
