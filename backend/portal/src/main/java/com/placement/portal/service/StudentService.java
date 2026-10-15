
package com.placement.portal.service;

import com.placement.portal.entity.Student;
import com.placement.portal.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StudentService {

    private final StudentRepository studentRepository;

    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public Optional<Student> getStudentById(Long id) {
        return studentRepository.findById(id);
    }

    // Find a student using their roll number
    public Optional<Student> findByRollNumber(String rollNumber) {
        return studentRepository.findByRollNumberIgnoreCase(rollNumber);
    }

    public Student createStudent(Student student) {
        return studentRepository.save(student);
    }

    public Student updateStudent(Long id, Student studentDetails) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        student.setName(studentDetails.getName());
        student.setEmail(studentDetails.getEmail());
        student.setRollNumber(studentDetails.getRollNumber());
        student.setBranch(studentDetails.getBranch());
        student.setCgpa(studentDetails.getCgpa());
        student.setGraduationYear(studentDetails.getGraduationYear());
        student.setSkills(studentDetails.getSkills());

        return studentRepository.save(student);
    }

    public void deleteStudent(Long id) {
        studentRepository.deleteById(id);
    }
}