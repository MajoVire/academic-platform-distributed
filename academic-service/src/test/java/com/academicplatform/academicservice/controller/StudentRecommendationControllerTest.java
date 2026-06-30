package com.academicplatform.academicservice.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import com.academicplatform.academicservice.dto.RecommendationItemResponse;
import com.academicplatform.academicservice.dto.StudentRecommendationsResponse;
import com.academicplatform.academicservice.messaging.AcademicEventPublisher;
import com.academicplatform.academicservice.service.StudentRecommendationService;

@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser
class StudentRecommendationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AcademicEventPublisher academicEventPublisher;

    @MockBean
    private StudentRecommendationService studentRecommendationService;

    @Test
    void shouldReturnRecommendationsForStudent() throws Exception {
        when(studentRecommendationService.getRecommendations(1L)).thenReturn(
                new StudentRecommendationsResponse(
                        1L,
                        List.of(new RecommendationItemResponse(
                                "Curso recomendado: Comunicacion entre microservicios",
                                "Completaste un recurso relacionado con sistemas distribuidos."))));

        mockMvc.perform(get("/api/students/1/recommendations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.studentId").value(1))
                .andExpect(jsonPath("$.recommendations[0].title").value("Curso recomendado: Comunicacion entre microservicios"));
    }
}
