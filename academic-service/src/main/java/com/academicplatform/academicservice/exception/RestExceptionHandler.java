package com.academicplatform.academicservice.exception;

import java.util.concurrent.CompletionException;
import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class RestExceptionHandler {

    @ExceptionHandler({SubjectNotFoundException.class, CourseNotFoundException.class, ResourceNotFoundException.class})
    public ResponseEntity<ApiErrorResponse> handleNotFound(RuntimeException exception) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiErrorResponse(HttpStatus.NOT_FOUND.value(), exception.getMessage(), LocalDateTime.now().toString()));
    }

    @ExceptionHandler(CompletionException.class)
    public ResponseEntity<ApiErrorResponse> handleCompletionException(CompletionException exception) {
        Throwable cause = exception.getCause();
        if (cause instanceof SubjectNotFoundException subjectNotFoundException) {
            return handleNotFound(subjectNotFoundException);
        }
        if (cause instanceof CourseNotFoundException courseNotFoundException) {
            return handleNotFound(courseNotFoundException);
        }
        if (cause instanceof ResourceNotFoundException resourceNotFoundException) {
            return handleNotFound(resourceNotFoundException);
        }
        return handleGeneric(exception);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGeneric(Exception exception) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Unexpected error", LocalDateTime.now().toString()));
    }

    public record ApiErrorResponse(int status, String message, String timestamp) {
    }
}
