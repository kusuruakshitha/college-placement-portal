
package com.placement.portal.controller;

import com.placement.portal.entity.PlacementOfficer;
import com.placement.portal.repository.PlacementOfficerRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/placement-officers")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    "http://localhost:5177",
    "http://localhost:5178"
})
public class PlacementOfficerController {

    private final PlacementOfficerRepository repository;

    public PlacementOfficerController(
            PlacementOfficerRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<PlacementOfficer> getAllOfficers() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlacementOfficer> getOfficerById(
            @PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public PlacementOfficer createOfficer(
            @RequestBody PlacementOfficer officer) {
        officer.setId(null);
        return repository.save(officer);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PlacementOfficer> updateOfficer(
            @PathVariable Long id,
            @RequestBody PlacementOfficer updatedOfficer) {

        return repository.findById(id)
                .map(officer -> {
                    officer.setName(updatedOfficer.getName());
                    officer.setEmail(updatedOfficer.getEmail());
                    officer.setDepartment(updatedOfficer.getDepartment());
                    officer.setPhone(updatedOfficer.getPhone());
                    officer.setStatus(updatedOfficer.getStatus());

                    return ResponseEntity.ok(repository.save(officer));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOfficer(
            @PathVariable Long id) {

        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
