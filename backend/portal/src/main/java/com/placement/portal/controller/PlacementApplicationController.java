
package com.placement.portal.controller;

import com.placement.portal.entity.PlacementApplication;
import com.placement.portal.entity.PlacementDrive;
import com.placement.portal.entity.Student;
import com.placement.portal.repository.PlacementApplicationRepository;
import com.placement.portal.repository.PlacementDriveRepository;
import com.placement.portal.repository.StudentRepository;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/placement-applications")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    "http://localhost:5177",
    "http://localhost:5178",
    "http://localhost:1533",
    "http://localhost:1534"
})
public class PlacementApplicationController {

    private final PlacementApplicationRepository applicationRepository;
    private final PlacementDriveRepository driveRepository;
    private final StudentRepository studentRepository;

    public PlacementApplicationController(
            PlacementApplicationRepository applicationRepository,
            PlacementDriveRepository driveRepository,
            StudentRepository studentRepository) {
        this.applicationRepository = applicationRepository;
        this.driveRepository = driveRepository;
        this.studentRepository = studentRepository;
    }

    @PostMapping
    public ResponseEntity<?> apply(
            @RequestBody Map<String, Object> request) {

        Object studentValue = request.get("studentId");
        Object driveValue = request.get("placementDriveId");

        if (studentValue == null || driveValue == null) {
            return ResponseEntity.badRequest().body(
                Map.of("message",
                    "Student ID and placement drive ID are required.")
            );
        }

        final Long studentId;
        final Long driveId;

        try {
            studentId = Long.valueOf(studentValue.toString());
            driveId = Long.valueOf(driveValue.toString());

            if (studentId <= 0 || driveId <= 0) {
                throw new NumberFormatException();
            }
        } catch (NumberFormatException exception) {
            return ResponseEntity.badRequest().body(
                Map.of("message", "Student ID and placement drive ID must be positive numbers.")
            );
        }

        Student student = studentRepository.findById(studentId)
            .orElse(null);

        if (student == null) {
            return ResponseEntity.badRequest().body(
                Map.of("message", "Student not found.")
            );
        }

        PlacementDrive drive = driveRepository.findById(driveId)
            .orElse(null);

        if (drive == null) {
            return ResponseEntity.badRequest().body(
                Map.of("message", "Placement drive not found.")
            );
        }

        if (!"Open".equalsIgnoreCase(drive.getStatus())) {
            return ResponseEntity.badRequest().body(
                Map.of("message",
                    "This placement drive is not open for applications.")
            );
        }

        if (applicationRepository
                .existsByStudentIdAndPlacementDriveId(studentId, driveId)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                Map.of("message",
                    "You have already applied for this placement drive.")
            );
        }

        try {
            PlacementApplication application =
                new PlacementApplication();

            application.setStudentId(student.getId());
            application.setPlacementDriveId(drive.getId());
            application.setStudentName(student.getName());
            application.setStudentEmail(student.getEmail());
            application.setRollNumber(student.getRollNumber());
            application.setCompanyName(drive.getCompanyName());
            application.setDriveName(drive.getDriveName());
            application.setStatus("Applied");

            // The entity's @PrePersist should set appliedAt.
            PlacementApplication saved =
                applicationRepository.save(application);

            return ResponseEntity.status(HttpStatus.CREATED)
                .body(saved);

        } catch (DataIntegrityViolationException exception) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                Map.of("message",
                    "An application for this placement drive already exists.")
            );
        }
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<PlacementApplication>>
            getStudentApplications(@PathVariable Long studentId) {

        if (!studentRepository.existsById(studentId)) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(
            applicationRepository.findByStudentId(studentId)
        );
    }
}
