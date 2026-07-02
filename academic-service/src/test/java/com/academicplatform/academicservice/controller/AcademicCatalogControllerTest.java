package com.academicplatform.academicservice.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class AcademicCatalogControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private RequestPostProcessor jwtWithRoles(String... roles) {
        return jwt()
                .jwt(jwt -> jwt.claim("realm_access", Map.of("roles", List.of(roles))))
                .authorities(Arrays.stream(roles)
                        .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                        .toArray(SimpleGrantedAuthority[]::new));
    }

    @Test
    void shouldReturnSubjects() throws Exception {
        mockMvc.perform(get("/api/subjects").with(jwtWithRoles("STUDENT")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("Sistemas Distribuidos"));
    }

    @Test
    void shouldReturnCoursesBySubject() throws Exception {
        mockMvc.perform(get("/api/subjects/1/courses").with(jwtWithRoles("PROFESSOR")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Introduccion a Sistemas Distribuidos"));
    }

    @Test
    void shouldReturnResourcesByCourse() throws Exception {
        mockMvc.perform(get("/api/courses/1/resources").with(jwtWithRoles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Introduccion a Docker"));
    }

    @Test
    void shouldReturnNotFoundForMissingSubject() throws Exception {
        mockMvc.perform(get("/api/subjects/999/courses").with(jwtWithRoles("STUDENT")))
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

    @Test
    void shouldRejectProtectedCatalogEndpointWithoutJwt() throws Exception {
        mockMvc.perform(get("/api/subjects"))
                .andExpect(status().isUnauthorized());
    }
}
