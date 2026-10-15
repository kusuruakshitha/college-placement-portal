
package com.placement.portal.controller;

import com.placement.portal.entity.Application;
import com.placement.portal.service.ApplicationService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "*")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(
            ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    // GET: Retrieve all applications
    @GetMapping
    public ResponseEntity<List<Application>> getAllApplications() {
        return ResponseEntity.ok(
                applicationService.getAllApplications());
    }

    // GET: Retrieve one application
    @GetMapping("/{id}")
    public ResponseEntity<Application> getApplicationById(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                applicationService.getApplicationById(id));
    }

    // POST: Create an application
    @PostMapping
    public ResponseEntity<Application> createApplication(
            @RequestBody Application application) {
        Application created =
                applicationService.createApplication(application);

        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // PUT: Update an application
    @PutMapping("/{id}")
    public ResponseEntity<Application> updateApplication(
            @PathVariable Long id,
            @RequestBody Application application) {
        return ResponseEntity.ok(
                applicationService.updateApplication(id, application));
    }

    // PATCH: Update application status only
    @PatchMapping("/{id}/status")
    public ResponseEntity<Application> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {

        String status = request.get("status");

        if (status == null || status.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(
                applicationService.updateStatus(id, status));
    }

    // DELETE: Remove an application
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplication(
            @PathVariable Long id) {
        applicationService.deleteApplication(id);
        return ResponseEntity.noContent().build();
    }
}
