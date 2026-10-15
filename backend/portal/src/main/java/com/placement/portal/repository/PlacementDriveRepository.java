
package com.placement.portal.repository;

import com.placement.portal.entity.PlacementDrive;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlacementDriveRepository
        extends JpaRepository<PlacementDrive, Long> {
}
