
package com.placement.portal.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "placement_applications")
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id")
    private Long studentId;

    @Column(name = "student_name", nullable = false)
    private String student;

    @Column(name = "drive_id")
    private Long driveId;

    @Column(name = "company_name")
    private String company;

    @Column(name = "job_role")
    private String role;

    @Column(name = "applied_date")
    private LocalDate date;

    @Column(name = "application_status", nullable = false)
    private String status = "Applied";

    public Application() {
        this.status = "Applied";
    }

    @PrePersist
    protected void onCreate() {
        if (date == null) {
            date = LocalDate.now();
        }

        if (status == null || status.isBlank()) {
            status = "Applied";
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getStudent() {
        return student;
    }

    public void setStudent(String student) {
        this.student = student;
    }

    public Long getDriveId() {
        return driveId;
    }

    public void setDriveId(Long driveId) {
        this.driveId = driveId;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
