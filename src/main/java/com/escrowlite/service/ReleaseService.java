package com.escrowlite.service;

import com.escrowlite.entity.Milestone;
import com.escrowlite.entity.Project;
import com.escrowlite.entity.Release;
import com.escrowlite.repository.MilestoneRepository;
import com.escrowlite.repository.ProjectRepository;
import com.escrowlite.repository.ReleaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReleaseService {

    private final ReleaseRepository releaseRepository;
    private final MilestoneRepository milestoneRepository;
    private final ProjectRepository projectRepository;

    @Autowired
    public ReleaseService(ReleaseRepository releaseRepository,
                          MilestoneRepository milestoneRepository,
                          ProjectRepository projectRepository) {
        this.releaseRepository = releaseRepository;
        this.milestoneRepository = milestoneRepository;
        this.projectRepository = projectRepository;
    }

    public List<Release> getAllReleases() {
        return releaseRepository.findAll();
    }

    public Release getReleaseById(Long id) {
        return releaseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Release not found with id: " + id));
    }

    public Release getReleaseByMilestoneId(Long milestoneId) {
        return releaseRepository.findByMilestoneId(milestoneId)
                .orElse(null);
    }

    @Transactional
    public Release releasePayment(Long milestoneId) {
        Milestone milestone = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new IllegalArgumentException("Milestone not found with id: " + milestoneId));

        if (!"COMPLETED".equalsIgnoreCase(milestone.getStatus())) {
            throw new IllegalStateException("Payment can only be released when milestone status is COMPLETED. Current status: " + milestone.getStatus());
        }

        // Check if already released
        if (releaseRepository.findByMilestoneId(milestoneId).isPresent()) {
            throw new IllegalStateException("Payment has already been released for milestone id: " + milestoneId);
        }

        // Update milestone status to RELEASED
        milestone.setStatus("RELEASED");
        milestoneRepository.save(milestone);

        // Create and save release record
        Release release = new Release();
        release.setMilestone(milestone);
        release.setAmount(milestone.getAmount());
        release.setReleaseDate(LocalDateTime.now());
        release.setStatus("RELEASED");
        Release savedRelease = releaseRepository.save(release);

        // Check if all milestones for this project are released
        Project project = milestone.getProject();
        if (project != null) {
            List<Milestone> projectMilestones = milestoneRepository.findByProjectId(project.getId());
            boolean allReleased = !projectMilestones.isEmpty() && projectMilestones.stream()
                    .allMatch(m -> "RELEASED".equalsIgnoreCase(m.getStatus()));
            if (allReleased) {
                project.setStatus("COMPLETED");
                projectRepository.save(project);
            }
        }

        return savedRelease;
    }
}
