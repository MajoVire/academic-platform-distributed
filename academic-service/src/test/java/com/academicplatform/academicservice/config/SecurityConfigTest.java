package com.academicplatform.academicservice.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;

class SecurityConfigTest {

    private final SecurityConfig securityConfig = new SecurityConfig();

    @Test
    void shouldMapRealmAccessRolesToSpringAuthorities() {
        Jwt jwt = Jwt.withTokenValue("token")
                .header("alg", "none")
                .claim("realm_access", Map.of("roles", List.of("STUDENT", "PROFESSOR")))
                .build();

        var authentication = securityConfig.jwtAuthenticationConverter().convert(jwt);

        assertThat(authentication).isNotNull();
        assertThat(authentication.getAuthorities())
                .extracting("authority")
                .contains("ROLE_STUDENT", "ROLE_PROFESSOR");
    }

    @Test
    void shouldNotAssignDefaultStudentRoleWhenJwtHasNoRoles() {
        Jwt jwt = Jwt.withTokenValue("token")
                .header("alg", "none")
                .subject("user-without-roles")
                .build();

        var authentication = securityConfig.jwtAuthenticationConverter().convert(jwt);

        assertThat(authentication).isNotNull();
        assertThat(authentication.getAuthorities())
                .extracting("authority")
                .doesNotContain("ROLE_STUDENT");
    }
}
