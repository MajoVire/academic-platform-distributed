package com.academicplatform.academicservice.config;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/health").permitAll()
                .requestMatchers("/actuator/health", "/actuator/health/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/subjects").hasAnyRole("STUDENT", "PROFESSOR", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/subjects/*/courses").hasAnyRole("STUDENT", "PROFESSOR", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/courses/*/resources").hasAnyRole("STUDENT", "PROFESSOR", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/catalog/resources/count").hasAnyRole("STUDENT", "PROFESSOR", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/students/*/resources/*/complete").hasAnyRole("STUDENT", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/students/*/resources/*/complete").hasAnyRole("STUDENT", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/students/*/progress").hasAnyRole("STUDENT", "PROFESSOR", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/students/*/recommendations").hasAnyRole("STUDENT", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/students/*/courses/*/enroll").hasAnyRole("STUDENT", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/students/*/courses").hasAnyRole("STUDENT", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/professors/*/students").hasAnyRole("PROFESSOR", "ADMIN")
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
            );
            
        return http.build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> extractRoles(jwt));
        return converter;
    }

    @SuppressWarnings("unchecked")
    private Collection<GrantedAuthority> extractRoles(Jwt jwt) {
        Map<String, Object> realmAccess = jwt.getClaim("realm_access");
        if (realmAccess == null || !realmAccess.containsKey("roles")) {
            return List.of();
        }
        
        Object rolesClaim = realmAccess.get("roles");
        if (!(rolesClaim instanceof Collection<?> roles)) {
            return List.of();
        }

        return roles.stream()
                .filter(String.class::isInstance)
                .map(String.class::cast)
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
                .collect(Collectors.toList());
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
