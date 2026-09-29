package com.escrowlite.service;

import com.escrowlite.entity.Milestone;
import com.escrowlite.entity.Project;
import com.escrowlite.repository.MilestoneRepository;
import com.escrowlite.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MilestoneService {

    private final MilestoneRepository milestoneRepository;
    private final ProjectRepository projectRepository;

    @Autowired
    public MilestoneService(MilestoneRepository milestoneRepository, ProjectRepository projectRepository) {
        this.milestoneRepository = milestoneRepository;
        this.projectRepository = projectRepository;
    }

    public List<Milestone> getAllMilestones() {
        return milestoneRepository.findAll();
    }

    public Milestone getMilestoneById(Long id) {
        return milestoneRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Milestone not found with id: " + id));
    }

    public List<Milestone> getMilestonesByProjectId(Long projectId) {
        return milestoneRepository.findByProjectId(projectId);
    }

    public Milestone createMilestone(Long projectId, Milestone milestone) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));

        milestone.setProject(project);
        if (milestone.getStatus() == null || milestone.getStatus().trim().isEmpty()) {
            milestone.setStatus("PENDING");
        }
        return milestoneRepository.save(milestone);
    }

    public Milestone updateMilestone(Long id, Milestone milestoneDetails) {
        Milestone existingMilestone = getMilestoneById(id);
        existingMilestone.setTitle(milestoneDetails.getTitle());
        existingMilestone.setDescription(milestoneDetails.getDescription());
        existingMilestone.setAmount(milestoneDetails.getAmount());
        if (milestoneDetails.getStatus() != null && !milestoneDetails.getStatus().trim().isEmpty()) {
            existingMilestone.setStatus(milestoneDetails.getStatus());
        }
        return milestoneRepository.save(existingMilestone);
    }

    public Milestone updateMilestoneStatus(Long id, String status) {
        Milestone milestone = getMilestoneById(id);
        milestone.setStatus(status.toUpperCase());
        return milestoneRepository.save(milestone);
    }

    public void deleteMilestone(Long id) {
        Milestone milestone = getMilestoneById(id);
        milestoneRepository.delete(milestone);
    }
}
