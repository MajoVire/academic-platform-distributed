package com.academicplatform.academicservice.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;

import java.time.LocalDateTime;
import java.util.List;
import java.sql.SQLException;
import javax.sql.DataSource;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

import com.academicplatform.academicservice.model.AcademicActivity;

@ExtendWith(MockitoExtension.class)
class JdbcAcademicActivityRepositoryTests {

    @Mock
    private JdbcTemplate jdbcTemplate;

    @InjectMocks
    private JdbcAcademicActivityRepository repository;

    @Test
    void shouldPersistActivityUsingKubernetesSchema() {
        AcademicActivity activity = new AcademicActivity(
                1L,
                2L,
                "RabbitMQ para principiantes",
                LocalDateTime.parse("2026-07-02T03:06:22"),
                "academic-async-2");

        repository.save(activity);

        verify(jdbcTemplate).update(
                contains("INSERT INTO activity_log"),
                eq(1L),
                eq(2L),
                eq("RabbitMQ para principiantes"),
                eq("RESOURCE_COMPLETED"),
                contains("Student 1 completed resource 'RabbitMQ para principiantes'"),
                eq("academic-async-2"),
                eq(activity.completedAt()));
    }

    @Test
    void shouldReadActivitiesUsingFinalSchema() {
        FakeJdbcTemplate jdbcTemplate = new FakeJdbcTemplate();
        jdbcTemplate.activities = List.of(new AcademicActivity(
                7L,
                11L,
                "Introduccion a Docker",
                LocalDateTime.parse("2026-07-02T03:06:22"),
                "academic-thread-1"));

        JdbcAcademicActivityRepository repository = new JdbcAcademicActivityRepository(jdbcTemplate);

        List<AcademicActivity> activities = repository.findAll();

        assertEquals(1, activities.size());
        assertEquals(7L, activities.get(0).studentId());
        assertEquals(11L, activities.get(0).resourceId());
        assertEquals("Introduccion a Docker", activities.get(0).resourceTitle());
        assertEquals(LocalDateTime.parse("2026-07-02T03:06:22"), activities.get(0).completedAt());
        assertEquals("academic-thread-1", activities.get(0).threadName());
    }

    private static final class FakeJdbcTemplate extends JdbcTemplate {
        private List<AcademicActivity> activities = List.of();

        private FakeJdbcTemplate() {
            super(org.mockito.Mockito.mock(DataSource.class));
        }

        @Override
        public <T> List<T> query(String sql, RowMapper<T> rowMapper) {
            if (sql.contains("resource_title") && sql.contains("thread_name")) {
                return castList(activities);
            }

            throw new AssertionError("Consulta inesperada: " + sql);
        }

        @SuppressWarnings("unchecked")
        private static <T> List<T> castList(List<?> values) {
            return (List<T>) values;
        }
    }
}
