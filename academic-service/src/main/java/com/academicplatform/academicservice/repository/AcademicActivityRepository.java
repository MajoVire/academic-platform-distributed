package com.academicplatform.academicservice.repository;

import java.util.List;

import com.academicplatform.academicservice.model.AcademicActivity;

public interface AcademicActivityRepository {

    void save(AcademicActivity activity);

    List<AcademicActivity> findAll();
}
