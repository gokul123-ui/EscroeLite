package com.escrowlite.repository;

import com.escrowlite.entity.Milestone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MilestoneRepository extends JpaRepository<Milestone, Long> {
    List<Milestone> findByProjectId(Long projectId);
    List<Milestone> findByStatus(String status);
}
