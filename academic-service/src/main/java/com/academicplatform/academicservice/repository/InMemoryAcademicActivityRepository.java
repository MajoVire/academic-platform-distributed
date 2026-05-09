package com.academicplatform.academicservice.repository;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.stereotype.Repository;
import org.springframework.context.annotation.Profile;

import com.academicplatform.academicservice.model.AcademicActivity;

@Repository
@Profile("!postgres")
public class InMemoryAcademicActivityRepository implements AcademicActivityRepository {

    private final CopyOnWriteArrayList<AcademicActivity> activities = new CopyOnWriteArrayList<>();

    @Override
    public void save(AcademicActivity activity) {
        activities.add(activity);
    }

    @Override
    public List<AcademicActivity> findAll() {
        return List.copyOf(activities);
    }
}
