package com.homevista.homevista.repository;

import com.homevista.homevista.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, Long> {
}