package com.escrowlite.controller;

import com.escrowlite.entity.Milestone;
import com.escrowlite.service.MilestoneService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/milestones")
@CrossOrigin(origins = "*")
public class MilestoneController {

    private final MilestoneService milestoneService;

    @Autowired
    public MilestoneController(MilestoneService milestoneService) {
        this.milestoneService = milestoneService;
    }

    @GetMapping
    public ResponseEntity<List<Milestone>> getAllMilestones() {
        return ResponseEntity.ok(milestoneService.getAllMilestones());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Milestone> getMilestoneById(@PathVariable Long id) {
        return ResponseEntity.ok(milestoneService.getMilestoneById(id));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Milestone>> getMilestonesByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(milestoneService.getMilestonesByProjectId(projectId));
    }

    @PostMapping("/project/{projectId}")
    public ResponseEntity<Milestone> createMilestone(@PathVariable Long projectId, @RequestBody Milestone milestone) {
        Milestone created = milestoneService.createMilestone(projectId, milestone);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Milestone> updateMilestone(@PathVariable Long id, @RequestBody Milestone milestone) {
        return ResponseEntity.ok(milestoneService.updateMilestone(id, milestone));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Milestone> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(milestoneService.updateMilestoneStatus(id, status));
    }

    @PatchMapping("/{id}/start")
    public ResponseEntity<Milestone> startMilestone(@PathVariable Long id) {
        return ResponseEntity.ok(milestoneService.updateMilestoneStatus(id, "IN_PROGRESS"));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<Milestone> completeMilestone(@PathVariable Long id) {
        return ResponseEntity.ok(milestoneService.updateMilestoneStatus(id, "COMPLETED"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteMilestone(@PathVariable Long id) {
        milestoneService.deleteMilestone(id);
        return ResponseEntity.ok(Map.of("message", "Milestone deleted successfully with id: " + id));
    }
}
