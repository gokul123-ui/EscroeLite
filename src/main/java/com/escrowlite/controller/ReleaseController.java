package com.escrowlite.controller;

import com.escrowlite.entity.Release;
import com.escrowlite.service.ReleaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/releases")
@CrossOrigin(origins = "*")
public class ReleaseController {

    private final ReleaseService releaseService;

    @Autowired
    public ReleaseController(ReleaseService releaseService) {
        this.releaseService = releaseService;
    }

    @GetMapping
    public ResponseEntity<List<Release>> getAllReleases() {
        return ResponseEntity.ok(releaseService.getAllReleases());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Release> getReleaseById(@PathVariable Long id) {
        return ResponseEntity.ok(releaseService.getReleaseById(id));
    }

    @GetMapping("/milestone/{milestoneId}")
    public ResponseEntity<Release> getReleaseByMilestone(@PathVariable Long milestoneId) {
        Release release = releaseService.getReleaseByMilestoneId(milestoneId);
        if (release != null) {
            return ResponseEntity.ok(release);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/{milestoneId}/release")
    public ResponseEntity<?> releasePayment(@PathVariable Long milestoneId) {
        try {
            Release release = releaseService.releasePayment(milestoneId);
            return new ResponseEntity<>(release, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        } catch (IllegalStateException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "An error occurred while processing the release: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
