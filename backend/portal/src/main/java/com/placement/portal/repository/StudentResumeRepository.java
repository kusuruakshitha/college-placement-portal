
package com.placement.portal.repository;

import com.placement.portal.entity.StudentResume;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentResumeRepository
        extends JpaRepository<StudentResume, Long> {

    List<StudentResume> findByStudentIdOrderByUploadedAtDesc(Long studentId);
}
