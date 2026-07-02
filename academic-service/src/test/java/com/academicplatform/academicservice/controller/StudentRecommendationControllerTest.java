package com.academicplatform.academicservice.controller;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import com.academicplatform.academicservice.dto.RecommendationItemResponse;
import com.academicplatform.academicservice.dto.StudentRecommendationsResponse;
import com.academicplatform.academicservice.messaging.AcademicEventPublisher;
import com.academicplatform.academicservice.service.StudentRecommendationService;

@SpringBootTest
@AutoConfigureMockMvc
class StudentRecommendationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AcademicEventPublisher academicEventPublisher;

    @MockBean
    private StudentRecommendationService studentRecommendationService;

    private RequestPostProcessor jwtWithRoles(String... roles) {
        return jwt()
                .jwt(jwt -> jwt.claim("realm_access", Map.of("roles", List.of(roles))))
                .authorities(Arrays.stream(roles)
                        .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                        .toArray(SimpleGrantedAuthority[]::new));
    }

    @Test
    void shouldReturnRecommendationsForStudent() throws Exception {
        when(studentRecommendationService.getRecommendations(1L)).thenReturn(
                new StudentRecommendationsResponse(
                        1L,
                        List.of(new RecommendationItemResponse(
                                "Curso recomendado: Comunicacion entre microservicios",
                                "Completaste un recurso relacionado con sistemas distribuidos."))));

        mockMvc.perform(get("/api/students/1/recommendations").with(jwtWithRoles("STUDENT")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.studentId").value(1))
                .andExpect(jsonPath("$.recommendations[0].title").value("Curso recomendado: Comunicacion entre microservicios"));
    }

    @Test
    void shouldRejectRecommendationsForInsufficientRole() throws Exception {
        mockMvc.perform(get("/api/students/1/recommendations").with(jwtWithRoles("PROFESSOR")))
                .andExpect(status().isForbidden());
    }
}
