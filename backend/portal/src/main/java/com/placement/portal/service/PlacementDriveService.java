
package com.placement.portal.service;

import com.placement.portal.entity.PlacementDrive;
import com.placement.portal.repository.PlacementDriveRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PlacementDriveService {

    private final PlacementDriveRepository placementDriveRepository;

    public PlacementDriveService(
            PlacementDriveRepository placementDriveRepository) {
        this.placementDriveRepository = placementDriveRepository;
    }

    // Get all placement drives
    public List<PlacementDrive> getAllPlacementDrives() {
        return placementDriveRepository.findAll();
    }

    // Get one placement drive by ID
    public PlacementDrive getPlacementDriveById(Long id) {
        return placementDriveRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Placement drive not found with ID: " + id));
    }

    // Add a new placement drive
    public PlacementDrive createPlacementDrive(
            PlacementDrive placementDrive) {
        return placementDriveRepository.save(placementDrive);
    }

    // Update an existing placement drive
    public PlacementDrive updatePlacementDrive(
            Long id, PlacementDrive placementDrive) {

        PlacementDrive existingDrive = getPlacementDriveById(id);

        existingDrive.setCompanyId(placementDrive.getCompanyId());
        existingDrive.setCompanyName(placementDrive.getCompanyName());
        existingDrive.setDriveDate(placementDrive.getDriveDate());
        existingDrive.setDriveName(placementDrive.getDriveName());
        existingDrive.setStatus(placementDrive.getStatus());
        existingDrive.setVenue(placementDrive.getVenue());

        return placementDriveRepository.save(existingDrive);
    }

    // Delete a placement drive by ID
    public void deletePlacementDrive(Long id) {
        PlacementDrive existingDrive = getPlacementDriveById(id);
        placementDriveRepository.delete(existingDrive);
    }
}