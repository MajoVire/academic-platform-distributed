package com.academicplatform.academicservice.client;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import com.academicplatform.academicservice.dto.StudentRecommendationsResponse;

@SpringBootTest
class PythonRecommendationServiceClientTest {

    @Autowired
    private PythonRecommendationServiceClient recommendationServiceClient;

    @Autowired
    private RestTemplate recommendationServiceRestTemplate;

    @Test
    void shouldMapRecommendationsFromPythonService() {
        MockRestServiceServer server = MockRestServiceServer.bindTo(recommendationServiceRestTemplate).build();
        server.expect(requestTo("http://localhost:8000/recommendations/1"))
                .andExpect(method(org.springframework.http.HttpMethod.GET))
                .andRespond(withSuccess("""
                        {
                          "studentId": 1,
                          "recommendations": [
                            {
                              "title": "Curso recomendado: Comunicacion entre microservicios",
                              "reason": "Completaste un recurso relacionado con sistemas distribuidos."
                            }
                          ]
                        }
                        """, MediaType.APPLICATION_JSON));

        StudentRecommendationsResponse response = recommendationServiceClient.getRecommendations(1L);

        assertEquals(1L, response.studentId());
        assertEquals(1, response.recommendations().size());
        assertEquals("Curso recomendado: Comunicacion entre microservicios", response.recommendations().get(0).title());
        server.verify();
    }

    @Test
    void shouldReturnEmptyRecommendationsWhenPythonServiceFails() {
        MockRestServiceServer server = MockRestServiceServer.bindTo(recommendationServiceRestTemplate).build();
        server.expect(requestTo("http://localhost:8000/recommendations/2"))
                .andExpect(method(org.springframework.http.HttpMethod.GET))
                .andRespond(withServerError());

        StudentRecommendationsResponse response = recommendationServiceClient.getRecommendations(2L);

        assertEquals(2L, response.studentId());
        assertTrue(response.recommendations().isEmpty());
        server.verify();
    }
}
