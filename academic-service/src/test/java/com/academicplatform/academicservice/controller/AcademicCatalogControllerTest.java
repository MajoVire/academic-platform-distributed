package com.academicplatform.academicservice.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class AcademicCatalogControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldReturnSubjects() throws Exception {
        mockMvc.perform(get("/api/subjects"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("Sistemas Distribuidos"));
    }

    @Test
    void shouldReturnCoursesBySubject() throws Exception {
        mockMvc.perform(get("/api/subjects/1/courses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Introduccion a Sistemas Distribuidos"));
    }

    @Test
    void shouldReturnResourcesByCourse() throws Exception {
        mockMvc.perform(get("/api/courses/1/resources"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Introduccion a Docker"));
    }

    @Test
    void shouldReturnNotFoundForMissingSubject() throws Exception {
        mockMvc.perform(get("/api/subjects/999/courses"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Subject not found: 999"));
    }

    @Test
    void shouldReturnHealth() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.service").value("academic-service"));
    }
}
