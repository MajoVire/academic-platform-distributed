package com.academicplatform.academicservice.service;

import java.time.LocalDateTime;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import com.academicplatform.academicservice.dto.ResourceCompletionResponse;
import com.academicplatform.academicservice.model.AcademicActivity;
import com.academicplatform.academicservice.model.Course;
import com.academicplatform.academicservice.model.Resource;
import com.academicplatform.academicservice.model.StudentProgress;
import com.academicplatform.academicservice.model.Subject;
import com.academicplatform.academicservice.messaging.AcademicEventPublisher;
import com.academicplatform.academicservice.messaging.ResourceCompletedEvent;
import com.academicplatform.academicservice.repository.AcademicActivityRepository;
import com.academicplatform.academicservice.repository.StudentProgressRepository;

@Service
public class ResourceCompletionService {

    private static final Logger logger = LoggerFactory.getLogger(ResourceCompletionService.class);

    private final AcademicCatalogService academicCatalogService;
    private final StudentProgressRepository studentProgressRepository;
    private final AcademicActivityRepository academicActivityRepository;
    private final AcademicEventPublisher academicEventPublisher;
    private final Executor academicTaskExecutor;

    public ResourceCompletionService(
            AcademicCatalogService academicCatalogService,
            StudentProgressRepository studentProgressRepository,
            AcademicActivityRepository academicActivityRepository,
            AcademicEventPublisher academicEventPublisher,
            @Qualifier("academicTaskExecutor") Executor academicTaskExecutor) {
        this.academicCatalogService = academicCatalogService;
        this.studentProgressRepository = studentProgressRepository;
        this.academicActivityRepository = academicActivityRepository;
        this.academicEventPublisher = academicEventPublisher;
        this.academicTaskExecutor = academicTaskExecutor;
    }

    public ResourceCompletionResponse completeResource(Long studentId, Long resourceId) {
        LocalDateTime completedAt = LocalDateTime.now();

        CompletableFuture<Resource> resourceFuture = CompletableFuture.supplyAsync(() -> {
            logger.info("Resolving resource {} on thread {}", resourceId, Thread.currentThread().getName());
            return academicCatalogService.findResourceEntityById(resourceId);
        }, academicTaskExecutor);

        CompletableFuture<Course> courseFuture = resourceFuture.thenApplyAsync(resource -> {
            logger.info("Resolving course for resource {} on thread {}", resourceId, Thread.currentThread().getName());
            return academicCatalogService.findCourseEntityById(resource.courseId());
        }, academicTaskExecutor);

        CompletableFuture<Subject> subjectFuture = courseFuture.thenApplyAsync(course -> {
            logger.info("Resolving subject for course {} on thread {}", course.id(), Thread.currentThread().getName());
            return academicCatalogService.findSubjectEntityById(course.subjectId());
        }, academicTaskExecutor);

        CompletableFuture<ProgressUpdate> progressFuture = resourceFuture.thenApplyAsync(resource -> {
            logger.info("Updating progress for student {} on thread {}", studentId, Thread.currentThread().getName());
            boolean newlyCompleted = studentProgressRepository.markResourceCompleted(studentId, resourceId, completedAt);
            StudentProgress progress = studentProgressRepository.getOrCreate(studentId);
            return new ProgressUpdate(progress, newlyCompleted);
        }, academicTaskExecutor);

        CompletableFuture<Void> activityFuture = resourceFuture.thenAcceptAsync(resource -> {
            logger.info("Recording activity for student {} on thread {}", studentId, Thread.currentThread().getName());
            academicActivityRepository.save(new AcademicActivity(
                    studentId,
                    resourceId,
                    resource.title(),
                    completedAt,
                    Thread.currentThread().getName()));
        }, academicTaskExecutor);

        CompletableFuture<ResourceCompletionResponse> responseFuture = CompletableFuture
                .allOf(resourceFuture, courseFuture, subjectFuture, progressFuture, activityFuture)
                .thenApplyAsync(ignored -> {
                    Resource resource = resourceFuture.join();
                    Course course = courseFuture.join();
                    Subject subject = subjectFuture.join();
                    ProgressUpdate progressUpdate = progressFuture.join();

                    logger.info(
                            "Building completion response for student {} on thread {}",
                            studentId,
                            Thread.currentThread().getName());

                    return ResourceCompletionResponse.from(
                            studentId,
                            progressUpdate.progress(),
                            subject,
                            course,
                            resource,
                            progressUpdate.newlyCompleted(),
                            completedAt);
                }, academicTaskExecutor);

        CompletableFuture<Void> eventFuture = CompletableFuture
                .allOf(resourceFuture, courseFuture, subjectFuture, progressFuture, activityFuture)
                .thenRunAsync(() -> {
                    Resource resource = resourceFuture.join();
                    Course course = courseFuture.join();
                    Subject subject = subjectFuture.join();
                    academicEventPublisher.publishResourceCompleted(ResourceCompletedEvent.of(
                            studentId,
                            subject.id(),
                            course.id(),
                            resource.id(),
                            resource.title(),
                            completedAt));
                }, academicTaskExecutor);

        CompletableFuture.allOf(responseFuture, eventFuture).join();
        return responseFuture.join();
    }

    private record ProgressUpdate(StudentProgress progress, boolean newlyCompleted) {
    }
}
