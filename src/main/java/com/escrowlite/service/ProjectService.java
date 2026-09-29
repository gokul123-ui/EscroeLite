package com.escrowlite.service;

import com.escrowlite.entity.Project;
import com.escrowlite.repository.ProjectRepository;
import com.escrowlite.repository.ReleaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ReleaseRepository releaseRepository;

    @Autowired
    public ProjectService(ProjectRepository projectRepository, ReleaseRepository releaseRepository) {
        this.projectRepository = projectRepository;
        this.releaseRepository = releaseRepository;
    }

    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    public Project getProjectById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));
    }

    public Project createProject(Project project) {
        if (project.getStatus() == null || project.getStatus().trim().isEmpty()) {
            project.setStatus("ACTIVE");
        }
        return projectRepository.save(project);
    }

    public Project updateProject(Long id, Project projectDetails) {
        Project existingProject = getProjectById(id);
        existingProject.setProjectName(projectDetails.getProjectName());
        existingProject.setDescription(projectDetails.getDescription());
        existingProject.setClientName(projectDetails.getClientName());
        existingProject.setFreelancerName(projectDetails.getFreelancerName());
        existingProject.setTotalAmount(projectDetails.getTotalAmount());
        if (projectDetails.getStatus() != null && !projectDetails.getStatus().trim().isEmpty()) {
            existingProject.setStatus(projectDetails.getStatus());
        }
        return projectRepository.save(existingProject);
    }

    public void deleteProject(Long id) {
        Project project = getProjectById(id);
        projectRepository.delete(project);
    }

    public Map<String, Object> getDashboardStats() {
        List<Project> allProjects = projectRepository.findAll();
        long totalProjects = allProjects.size();
        long activeProjects = allProjects.stream()
                .filter(p -> "ACTIVE".equalsIgnoreCase(p.getStatus()) || "CREATED".equalsIgnoreCase(p.getStatus()))
                .count();

        double totalAmount = allProjects.stream()
                .mapToDouble(p -> p.getTotalAmount() != null ? p.getTotalAmount() : 0.0)
                .sum();

        Double releasedAmount = releaseRepository.getTotalReleasedAmount();
        if (releasedAmount == null) {
            releasedAmount = 0.0;
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalProjects", totalProjects);
        stats.put("activeProjects", activeProjects);
        stats.put("totalAmount", totalAmount);
        stats.put("releasedAmount", releasedAmount);

        return stats;
    }
}
