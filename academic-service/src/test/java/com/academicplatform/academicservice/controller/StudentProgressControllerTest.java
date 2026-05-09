package com.academicplatform.academicservice.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import com.academicplatform.academicservice.messaging.AcademicEventPublisher;

@SpringBootTest
@AutoConfigureMockMvc
class StudentProgressControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AcademicEventPublisher academicEventPublisher;

    @Test
    void shouldReturnEmptyProgressForStudentWithoutCompletions() throws Exception {
        mockMvc.perform(get("/api/students/99/progress"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.studentId").value(99))
                .andExpect(jsonPath("$.completedResourceIds").isEmpty())
                .andExpect(jsonPath("$.totalCompletedResources").value(0))
                .andExpect(jsonPath("$.lastCompletedAt").doesNotExist());
    }

    @Test
    void shouldReturnProgressAfterCompletingResource() throws Exception {
        mockMvc.perform(post("/api/students/10/resources/1/complete"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/students/10/progress"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.studentId").value(10))
                .andExpect(jsonPath("$.completedResourceIds[0]").value(1))
                .andExpect(jsonPath("$.totalCompletedResources").value(1))
                .andExpect(jsonPath("$.lastCompletedAt").exists());
    }
}
