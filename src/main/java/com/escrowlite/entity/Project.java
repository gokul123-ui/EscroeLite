package com.escrowlite.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "projects")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String projectName;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private String clientName;

    @Column(nullable = false)
    private String freelancerName;

    @Column(nullable = false)
    private Double totalAmount;

    @Column(nullable = false)
    private String status; // CREATED, ACTIVE, COMPLETED

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("project")
    private List<Milestone> milestones = new ArrayList<>();

    public Project() {
        this.status = "ACTIVE";
    }

    public Project(String projectName, String description, String clientName, String freelancerName, Double totalAmount, String status) {
        this.projectName = projectName;
        this.description = description;
        this.clientName = clientName;
        this.freelancerName = freelancerName;
        this.totalAmount = totalAmount;
        this.status = (status != null && !status.isEmpty()) ? status : "ACTIVE";
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getClientName() {
        return clientName;
    }

    public void setClientName(String clientName) {
        this.clientName = clientName;
    }

    public String getFreelancerName() {
        return freelancerName;
    }

    public void setFreelancerName(String freelancerName) {
        this.freelancerName = freelancerName;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<Milestone> getMilestones() {
        return milestones;
    }

    public void setMilestones(List<Milestone> milestones) {
        this.milestones = milestones;
    }
}
