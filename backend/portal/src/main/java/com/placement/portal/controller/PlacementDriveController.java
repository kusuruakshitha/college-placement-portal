
package com.placement.portal.controller;

import com.placement.portal.entity.PlacementDrive;
import com.placement.portal.service.PlacementDriveService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/placement-drives")
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
public class PlacementDriveController {

    private final PlacementDriveService placementDriveService;

    public PlacementDriveController(
            PlacementDriveService placementDriveService) {
        this.placementDriveService = placementDriveService;
    }

    // Get all placement drives
    @GetMapping
    public ResponseEntity<List<PlacementDrive>> getAllPlacementDrives() {
        return ResponseEntity.ok(
                placementDriveService.getAllPlacementDrives());
    }

    // Get a placement drive by ID
    @GetMapping("/{id}")
    public ResponseEntity<PlacementDrive> getPlacementDriveById(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                placementDriveService.getPlacementDriveById(id));
    }

    // Add a new placement drive
    @PostMapping
    public ResponseEntity<PlacementDrive> createPlacementDrive(
            @RequestBody PlacementDrive placementDrive) {

        PlacementDrive savedDrive =
                placementDriveService.createPlacementDrive(placementDrive);

        return ResponseEntity.status(HttpStatus.CREATED).body(savedDrive);
    }

    // Update an existing placement drive
    @PutMapping("/{id}")
    public ResponseEntity<PlacementDrive> updatePlacementDrive(
            @PathVariable Long id,
            @RequestBody PlacementDrive placementDrive) {

        PlacementDrive updatedDrive =
                placementDriveService.updatePlacementDrive(id, placementDrive);

        return ResponseEntity.ok(updatedDrive);
    }

    // Delete a placement drive
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlacementDrive(
            @PathVariable Long id) {

        placementDriveService.deletePlacementDrive(id);

        return ResponseEntity.noContent().build();
    }
}