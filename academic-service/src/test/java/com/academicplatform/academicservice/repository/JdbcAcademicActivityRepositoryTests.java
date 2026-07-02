package com.academicplatform.academicservice.repository;

import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;

import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;

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
                eq("RESOURCE_COMPLETED"),
                eq("RESOURCE"),
                eq(2L),
                contains("Student 1 completed resource 'RabbitMQ para principiantes'"),
                eq(activity.completedAt()));
    }
}
