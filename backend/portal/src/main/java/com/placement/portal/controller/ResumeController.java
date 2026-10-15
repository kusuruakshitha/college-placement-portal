
package com.placement.portal.controller;

import com.placement.portal.entity.Student;
import com.placement.portal.entity.StudentResume;
import com.placement.portal.repository.StudentResumeRepository;
import com.placement.portal.service.StudentService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/resumes")
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
public class ResumeController {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;

    private final StudentResumeRepository resumeRepository;
    private final StudentService studentService;

    private final Path uploadDirectory = Paths.get(
        "C:/Users/Dell/OneDrive/Documents/College Placement portal/uploads"
    ).toAbsolutePath().normalize();

    public ResumeController(
            StudentResumeRepository resumeRepository,
            StudentService studentService) {
        this.resumeRepository = resumeRepository;
        this.studentService = studentService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadResume(
            @RequestParam("file") MultipartFile file,
            @RequestParam("studentId") Long studentId) {

        if (studentId == null) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Student ID is required."));
        }

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Please select a resume."));
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Resume must not exceed 5 MB."));
        }

        String originalName = file.getOriginalFilename();

        if (originalName == null || originalName.isBlank()) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Invalid file name."));
        }

        String safeOriginalName = Paths.get(
            originalName.replace("\\", "/")
        ).getFileName().toString();

        String lowerName = safeOriginalName.toLowerCase(Locale.ROOT);

        if (!(lowerName.endsWith(".pdf")
                || lowerName.endsWith(".doc")
                || lowerName.endsWith(".docx"))) {
            return ResponseEntity.badRequest()
                .body(Map.of(
                    "message",
                    "Only PDF, DOC, and DOCX files are allowed."
                ));
        }

        Student student = studentService.getStudentById(studentId)
            .orElse(null);

        if (student == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Student not found."));
        }

        String extension = lowerName.substring(lowerName.lastIndexOf('.'));
        String storedName = UUID.randomUUID() + extension;
        Path savedPath = uploadDirectory.resolve(storedName).normalize();

        if (!savedPath.startsWith(uploadDirectory)) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Invalid file path."));
        }

        try {
            Files.createDirectories(uploadDirectory);
            Files.copy(file.getInputStream(), savedPath);

            StudentResume resume = new StudentResume();
            resume.setStudent(student);
            resume.setOriginalFileName(safeOriginalName);
            resume.setStoredFileName(storedName);
            resume.setFilePath(savedPath.toString());

            StudentResume savedResume = resumeRepository.save(resume);

            return ResponseEntity.ok(Map.of(
                "message", "Resume uploaded and linked to student successfully.",
                "resumeId", savedResume.getId(),
                "studentId", student.getId(),
                "studentName", student.getName(),
                "fileName", safeOriginalName
            ));

        } catch (IOException | RuntimeException e) {
            try {
                Files.deleteIfExists(savedPath);
            } catch (IOException ignored) {
                // Keep the original upload error.
            }

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "message",
                    "Resume upload failed. Please try again."
                ));
        }
    }
}
