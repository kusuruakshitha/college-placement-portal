
package com.placement.portal.service;

import com.placement.portal.entity.Application;
import com.placement.portal.entity.PlacementDrive;
import com.placement.portal.repository.ApplicationRepository;
import com.placement.portal.repository.PlacementDriveRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final PlacementDriveRepository placementDriveRepository;

    public ApplicationService(
            ApplicationRepository applicationRepository,
            PlacementDriveRepository placementDriveRepository) {
        this.applicationRepository = applicationRepository;
        this.placementDriveRepository = placementDriveRepository;
    }

    // Get all applications
    public List<Application> getAllApplications() {
        return applicationRepository.findAll();
    }

    // Get application by ID
    public Application getApplicationById(Long id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Application not found with ID: " + id));
    }

    // Create an application
    @Transactional
    public Application createApplication(Application application) {

        // Always create a new record
        application.setId(null);

        // Validate the selected placement drive
        if (application.getDriveId() == null) {
            throw new IllegalArgumentException(
                    "A placement drive must be selected before applying.");
        }

        // Set defaults
        if (application.getDate() == null) {
            application.setDate(LocalDate.now());
        }

        if (application.getStatus() == null
                || application.getStatus().isBlank()) {
            application.setStatus("Applied");
        }

        // Get company and drive information
        populateDriveDetails(application);

        // Save application
        return applicationRepository.save(application);
    }

    // Update an existing application
    @Transactional
    public Application updateApplication(
            Long id, Application updatedApplication) {

        Application existing = getApplicationById(id);

        if (updatedApplication.getStudentId() != null) {
            existing.setStudentId(updatedApplication.getStudentId());
        }

        if (updatedApplication.getStudent() != null
                && !updatedApplication.getStudent().isBlank()) {
            existing.setStudent(updatedApplication.getStudent());
        }

        if (updatedApplication.getDriveId() != null) {
            existing.setDriveId(updatedApplication.getDriveId());
        }

        if (updatedApplication.getCompany() != null
                && !updatedApplication.getCompany().isBlank()) {
            existing.setCompany(updatedApplication.getCompany());
        }

        if (updatedApplication.getRole() != null
                && !updatedApplication.getRole().isBlank()) {
            existing.setRole(updatedApplication.getRole());
        }

        if (updatedApplication.getDate() != null) {
            existing.setDate(updatedApplication.getDate());
        }

        if (updatedApplication.getStatus() != null
                && !updatedApplication.getStatus().isBlank()) {
            existing.setStatus(updatedApplication.getStatus());
        }

        // Restore defaults if old data is incomplete
        if (existing.getDate() == null) {
            existing.setDate(LocalDate.now());
        }

        if (existing.getStatus() == null
                || existing.getStatus().isBlank()) {
            existing.setStatus("Applied");
        }

        populateDriveDetails(existing);

        return applicationRepository.save(existing);
    }

    // Populate company and role using the selected placement drive
    private void populateDriveDetails(Application application) {

        Long driveId = application.getDriveId();

        if (driveId == null) {
            return;
        }

        PlacementDrive drive = placementDriveRepository.findById(driveId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Placement drive not found with ID: " + driveId));

        if (drive.getCompanyName() != null
                && !drive.getCompanyName().isBlank()) {
            application.setCompany(drive.getCompanyName());
        }

        // Uses driveName as the role because PlacementDrive
        // currently has no separate jobRole field.
        if ((application.getRole() == null
                || application.getRole().isBlank())
                && drive.getDriveName() != null
                && !drive.getDriveName().isBlank()) {
            application.setRole(drive.getDriveName());
        }
    }

    // Update application status
    @Transactional
    public Application updateStatus(Long id, String status) {

        if (status == null || status.isBlank()) {
            throw new IllegalArgumentException(
                    "Application status cannot be empty.");
        }

        if (!List.of("Applied", "Shortlisted", "Selected", "Rejected")
                .contains(status)) {
            throw new IllegalArgumentException(
                    "Invalid application status: " + status);
        }

        Application existing = getApplicationById(id);
        existing.setStatus(status);

        return applicationRepository.save(existing);
    }

    // Delete an application
    @Transactional
    public void deleteApplication(Long id) {
        Application existing = getApplicationById(id);
        applicationRepository.delete(existing);
    }
}
