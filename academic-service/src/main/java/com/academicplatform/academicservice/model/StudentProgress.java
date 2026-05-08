package com.academicplatform.academicservice.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class StudentProgress {

    private final Long studentId;
    private final Set<Long> completedResourceIds = new LinkedHashSet<>();
    private final Map<Long, LocalDateTime> completionTimes = new LinkedHashMap<>();
    private LocalDateTime lastCompletedAt;

    public StudentProgress(Long studentId) {
        this.studentId = studentId;
    }

    public synchronized boolean markResourceCompleted(Long resourceId, LocalDateTime completedAt) {
        boolean newlyCompleted = completedResourceIds.add(resourceId);
        completionTimes.putIfAbsent(resourceId, completedAt);
        lastCompletedAt = completedAt;
        return newlyCompleted;
    }

    public Long studentId() {
        return studentId;
    }

    public synchronized List<Long> completedResourceIds() {
        return Collections.unmodifiableList(new ArrayList<>(completedResourceIds));
    }

    public synchronized int totalCompletedResources() {
        return completedResourceIds.size();
    }

    public synchronized LocalDateTime lastCompletedAt() {
        return lastCompletedAt;
    }

    public synchronized LocalDateTime completionTimeFor(Long resourceId) {
        return completionTimes.get(resourceId);
    }
}
