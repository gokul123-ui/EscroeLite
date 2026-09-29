package com.escrowlite.repository;

import com.escrowlite.entity.Release;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReleaseRepository extends JpaRepository<Release, Long> {
    Optional<Release> findByMilestoneId(Long milestoneId);
    
    @Query("SELECT COALESCE(SUM(r.amount), 0.0) FROM Release r")
    Double getTotalReleasedAmount();
}
