package com.academicplatform.academicservice.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import com.academicplatform.academicservice.messaging.AcademicEventPublisher;

@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser
class ResourceCompletionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AcademicEventPublisher academicEventPublisher;

    @Test
    void shouldCompleteResourceForStudent() throws Exception {
        mockMvc.perform(post("/api/students/1/resources/1/complete"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.studentId").value(1))
                .andExpect(jsonPath("$.subjectId").value(1))
                .andExpect(jsonPath("$.courseId").value(1))
                .andExpect(jsonPath("$.resourceId").value(1))
                .andExpect(jsonPath("$.resourceTitle").value("Introduccion a Docker"))
                .andExpect(jsonPath("$.newlyCompleted").value(true))
                .andExpect(jsonPath("$.totalCompletedResources").value(1));
    }

    @Test
    void shouldCompleteResourceUsingAliasPathWithoutApiPrefix() throws Exception {
        mockMvc.perform(post("/students/3/resources/3/complete"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.studentId").value(3))
                .andExpect(jsonPath("$.resourceId").value(3))
                .andExpect(jsonPath("$.resourceTitle").value("RabbitMQ para principiantes"))
                .andExpect(jsonPath("$.newlyCompleted").value(true))
                .andExpect(jsonPath("$.totalCompletedResources").value(1));
    }

    @Test
    void shouldReturnNotFoundForMissingResource() throws Exception {
        mockMvc.perform(post("/api/students/1/resources/999/complete"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Resource not found: 999"));
    }

    @Test
    void shouldMarkResourceAsAlreadyCompletedOnSecondAttempt() throws Exception {
        mockMvc.perform(post("/api/students/2/resources/2/complete"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.newlyCompleted").value(true))
                .andExpect(jsonPath("$.totalCompletedResources").value(1));

        mockMvc.perform(post("/api/students/2/resources/2/complete"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.newlyCompleted").value(false))
                .andExpect(jsonPath("$.totalCompletedResources").value(1));
    }
}
