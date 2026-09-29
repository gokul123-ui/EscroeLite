package com.escrowlite.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "releases")
public class Release {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "milestone_id", nullable = false)
    private Milestone milestone;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private LocalDateTime releaseDate;

    @Column(nullable = false)
    private String status; // RELEASED

    public Release() {
        this.releaseDate = LocalDateTime.now();
        this.status = "RELEASED";
    }

    public Release(Milestone milestone, Double amount, LocalDateTime releaseDate, String status) {
        this.milestone = milestone;
        this.amount = amount;
        this.releaseDate = releaseDate != null ? releaseDate : LocalDateTime.now();
        this.status = (status != null && !status.isEmpty()) ? status : "RELEASED";
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Milestone getMilestone() {
        return milestone;
    }

    public void setMilestone(Milestone milestone) {
        this.milestone = milestone;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public LocalDateTime getReleaseDate() {
        return releaseDate;
    }

    public void setReleaseDate(LocalDateTime releaseDate) {
        this.releaseDate = releaseDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
