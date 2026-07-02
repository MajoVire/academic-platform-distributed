package com.academicplatform.academicservice.repository;

import java.util.List;
import java.util.Optional;
import java.util.function.Function;

import org.springframework.context.annotation.Profile;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.academicplatform.academicservice.model.Course;
import com.academicplatform.academicservice.model.Resource;
import com.academicplatform.academicservice.model.Subject;

@Repository
@Profile("postgres")
public class JdbcAcademicCatalogRepository implements AcademicCatalogRepository {

    private static final Logger logger = LoggerFactory.getLogger(JdbcAcademicCatalogRepository.class);
    private static final String DEFAULT_COURSE_TITLE_COLUMN = "title";
    private static final String LEGACY_COURSE_TITLE_COLUMN = "name";

    private final JdbcTemplate jdbcTemplate;

    public JdbcAcademicCatalogRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public List<Subject> findAllSubjects() {
        return jdbcTemplate.query(
                "SELECT id, name, description FROM subjects ORDER BY id",
                (rs, rowNum) -> new Subject(
                        rs.getLong("id"),
                        rs.getString("name"),
                        rs.getString("description")));
    }

    @Override
    public Optional<Subject> findSubjectById(Long subjectId) {
        return jdbcTemplate.query(
                "SELECT id, name, description FROM subjects WHERE id = ?",
                (rs, rowNum) -> new Subject(
                        rs.getLong("id"),
                        rs.getString("name"),
                        rs.getString("description")),
                subjectId).stream().findFirst();
    }

    @Override
    public List<Course> findCoursesBySubjectId(Long subjectId) {
        return executeCourseQuery(titleColumn -> jdbcTemplate.query(
                courseQuery("SELECT id, subject_id, %s AS title, description FROM courses WHERE subject_id = ? ORDER BY id", titleColumn),
                (rs, rowNum) -> new Course(
                        rs.getLong("id"),
                        rs.getLong("subject_id"),
                        rs.getString("title"),
                        rs.getString("description")),
                subjectId));
    }

    @Override
    public Optional<Course> findCourseById(Long courseId) {
        return executeCourseQuery(titleColumn -> jdbcTemplate.query(
                courseQuery("SELECT id, subject_id, %s AS title, description FROM courses WHERE id = ?", titleColumn),
                (rs, rowNum) -> new Course(
                        rs.getLong("id"),
                        rs.getLong("subject_id"),
                        rs.getString("title"),
                        rs.getString("description")),
                courseId).stream().findFirst());
    }

    @Override
    public List<Resource> findResourcesByCourseId(Long courseId) {
        return jdbcTemplate.query(
                "SELECT id, course_id, title, description, type FROM resources WHERE course_id = ? ORDER BY id",
                (rs, rowNum) -> new Resource(
                        rs.getLong("id"),
                        rs.getLong("course_id"),
                        rs.getString("title"),
                        rs.getString("description"),
                        rs.getString("type")),
                courseId);
    }

    @Override
    public Optional<Resource> findResourceById(Long resourceId) {
        return jdbcTemplate.query(
                "SELECT id, course_id, title, description, type FROM resources WHERE id = ?",
                (rs, rowNum) -> new Resource(
                        rs.getLong("id"),
                        rs.getLong("course_id"),
                        rs.getString("title"),
                        rs.getString("description"),
                        rs.getString("type")),
                resourceId).stream().findFirst();
    }

    @Override
    public long countAllResources() {
        Long count = jdbcTemplate.queryForObject("SELECT COUNT(id) FROM resources", Long.class);
        return count != null ? count : 0L;
    }

    private <T> T executeCourseQuery(Function<String, T> queryFunction) {
        try {
            return queryFunction.apply(DEFAULT_COURSE_TITLE_COLUMN);
        } catch (DataAccessException exception) {
            logger.warn(
                    "La consulta de courses con la columna 'title' falló. Reintentando con la columna de compatibilidad 'name'.",
                    exception);
            try {
                return queryFunction.apply(LEGACY_COURSE_TITLE_COLUMN);
            } catch (DataAccessException legacyException) {
                logger.error(
                        "La consulta de courses también falló con la columna de compatibilidad 'name'.",
                        legacyException);
                throw legacyException;
            }
        }
    }

    private String courseQuery(String queryTemplate, String courseTitleColumn) {
        return String.format(queryTemplate, courseTitleColumn);
    }
}
