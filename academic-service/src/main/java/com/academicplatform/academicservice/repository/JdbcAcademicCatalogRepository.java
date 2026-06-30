package com.academicplatform.academicservice.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.academicplatform.academicservice.model.Course;
import com.academicplatform.academicservice.model.Resource;
import com.academicplatform.academicservice.model.Subject;

@Repository
@Profile("postgres")
public class JdbcAcademicCatalogRepository implements AcademicCatalogRepository {

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
        return jdbcTemplate.query(
                "SELECT id, subject_id, title, description FROM courses WHERE subject_id = ? ORDER BY id",
                (rs, rowNum) -> new Course(
                        rs.getLong("id"),
                        rs.getLong("subject_id"),
                        rs.getString("title"),
                        rs.getString("description")),
                subjectId);
    }

    @Override
    public Optional<Course> findCourseById(Long courseId) {
        return jdbcTemplate.query(
                "SELECT id, subject_id, title, description FROM courses WHERE id = ?",
                (rs, rowNum) -> new Course(
                        rs.getLong("id"),
                        rs.getLong("subject_id"),
                        rs.getString("title"),
                        rs.getString("description")),
                courseId).stream().findFirst();
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
}
