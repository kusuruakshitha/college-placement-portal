
package com.placement.portal.controller;

import com.placement.portal.entity.Student;
import com.placement.portal.entity.User;
import com.placement.portal.service.StudentService;
import com.placement.portal.service.UserService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
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
public class AuthController {

    private final UserService userService;
    private final StudentService studentService;

    public AuthController(
            UserService userService,
            StudentService studentService) {
        this.userService = userService;
        this.studentService = studentService;
    }

    // FIND STUDENT BY ROLL NUMBER
    private Optional<Student> findStudentByRollNumber(String rollNumber) {
        if (isBlank(rollNumber)) {
            return Optional.empty();
        }

        String normalizedRoll = rollNumber.trim();

        return studentService.getAllStudents().stream()
                .filter(s -> s.getRollNumber() != null
                        && s.getRollNumber().trim()
                                .equalsIgnoreCase(normalizedRoll))
                .findFirst();
    }

    // FIND USER BY EMAIL
    private Optional<User> findUserByEmail(String email) {
        if (isBlank(email)) {
            return Optional.empty();
        }

        String normalizedEmail = email.trim();

        return userService.getAllUsers().stream()
                .filter(u -> u.getEmail() != null
                        && u.getEmail().trim()
                                .equalsIgnoreCase(normalizedEmail))
                .findFirst();
    }

    // VALIDATE EMAIL
    private boolean isValidEmail(String email) {
        return email != null
                && email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    }

    // STUDENT LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User request) {

        String rollNumber = request.getUsername();
        String password = request.getPassword();

        if (isBlank(rollNumber) || isBlank(password)) {
            return error(HttpStatus.BAD_REQUEST,
                    "Roll number and password are required.");
        }

        Optional<Student> student =
                findStudentByRollNumber(rollNumber);

        if (student.isEmpty()
                || isBlank(student.get().getEmail())) {
            return error(HttpStatus.UNAUTHORIZED,
                    "Invalid roll number or password.");
        }

        Optional<User> account =
                findUserByEmail(student.get().getEmail());

        if (account.isEmpty()) {
            return error(HttpStatus.UNAUTHORIZED,
                    "Invalid roll number or password.");
        }

        User user = account.get();

        if (!"STUDENT".equalsIgnoreCase(user.getRole())
                || user.getPassword() == null
                || !password.equals(user.getPassword())
                || isBlank(user.getUsername())
                || !rollNumber.trim()
                        .equalsIgnoreCase(user.getUsername().trim())) {
            return error(HttpStatus.UNAUTHORIZED,
                    "Invalid roll number or password.");
        }

        // UPDATED: Return the Student table ID as studentId.
        // Keep "id" as the User table ID for compatibility.
        Map<String, Object> response = userResponse(user);
        response.put("studentId", student.get().getId());

        return ResponseEntity.ok(response);
    }

    // ADMIN AND PLACEMENT OFFICER LOGIN
    @PostMapping("/staff-login")
    public ResponseEntity<?> staffLogin(
            @RequestBody Map<String, String> request) {

        String email = request.get("email");
        String password = request.get("password");
        String requestedRole = request.get("role");

        if (isBlank(email)
                || isBlank(password)
                || isBlank(requestedRole)) {
            return error(HttpStatus.BAD_REQUEST,
                    "Email, password, and role are required.");
        }

        String role = normalizeRole(requestedRole);

        if (!role.equals("ADMIN")
                && !role.equals("PLACEMENT_OFFICER")) {
            return error(HttpStatus.BAD_REQUEST,
                    "Invalid staff role.");
        }

        Optional<User> account = findUserByEmail(email);

        if (account.isEmpty()) {
            return error(HttpStatus.UNAUTHORIZED,
                    "Invalid email or password.");
        }

        User user = account.get();

        if (!role.equals(normalizeRole(user.getRole()))
                || user.getPassword() == null
                || !password.equals(user.getPassword())) {
            return error(HttpStatus.UNAUTHORIZED,
                    "Invalid email or password.");
        }

        return ResponseEntity.ok(userResponse(user));
    }

    // INITIAL ADMIN REGISTRATION
    // Works only if no Admin account exists.
    @Transactional
    @PostMapping("/admin-register")
    public ResponseEntity<?> registerAdmin(
            @RequestBody Map<String, String> request) {

        String email = request.get("email");
        String password = request.get("password");
        String confirmPassword = request.get("confirmPassword");

        if (isBlank(email)
                || isBlank(password)
                || isBlank(confirmPassword)) {
            return error(HttpStatus.BAD_REQUEST,
                    "Email and password fields are required.");
        }

        email = email.trim().toLowerCase();

        if (!isValidEmail(email)) {
            return error(HttpStatus.BAD_REQUEST,
                    "Enter a valid email address.");
        }

        if (password.length() < 8) {
            return error(HttpStatus.BAD_REQUEST,
                    "Password must contain at least 8 characters.");
        }

        if (!password.equals(confirmPassword)) {
            return error(HttpStatus.BAD_REQUEST,
                    "Passwords do not match.");
        }

        if (findUserByEmail(email).isPresent()) {
            return error(HttpStatus.CONFLICT,
                    "This email is already registered.");
        }

        boolean adminExists = userService.getAllUsers().stream()
                .anyMatch(u ->
                        "ADMIN".equalsIgnoreCase(
                                normalizeRole(u.getRole())));

        if (adminExists) {
            return error(HttpStatus.FORBIDDEN,
                    "An Admin account already exists. Contact your system administrator.");
        }

        User admin = new User();
        admin.setUsername(email);
        admin.setEmail(email);
        admin.setPassword(password);
        admin.setRole("ADMIN");

        userService.save(admin);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                Map.of("message",
                        "Admin account created successfully. You can now log in.")
        );
    }

    // PLACEMENT OFFICER REGISTRATION
    @Transactional
    @PostMapping("/staff-register")
    public ResponseEntity<?> registerStaff(
            @RequestBody Map<String, String> request) {

        String email = request.get("email");
        String password = request.get("password");
        String confirmPassword = request.get("confirmPassword");

        if (isBlank(email)
                || isBlank(password)
                || isBlank(confirmPassword)) {
            return error(HttpStatus.BAD_REQUEST,
                    "Email and password fields are required.");
        }

        email = email.trim().toLowerCase();

        if (!isValidEmail(email)) {
            return error(HttpStatus.BAD_REQUEST,
                    "Enter a valid email address.");
        }

        if (password.length() < 8) {
            return error(HttpStatus.BAD_REQUEST,
                    "Password must contain at least 8 characters.");
        }

        if (!password.equals(confirmPassword)) {
            return error(HttpStatus.BAD_REQUEST,
                    "Passwords do not match.");
        }

        if (findUserByEmail(email).isPresent()) {
            return error(HttpStatus.CONFLICT,
                    "This email is already registered.");
        }

        User officer = new User();
        officer.setUsername(email);
        officer.setEmail(email);
        officer.setPassword(password);
        officer.setRole("PLACEMENT_OFFICER");

        userService.save(officer);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                Map.of("message",
                        "Placement Officer account created successfully. You can now log in.")
        );
    }

    // ADMIN PASSWORD RESET - DEVELOPMENT ONLY
    @Transactional
    @PostMapping("/admin-reset-password")
    public ResponseEntity<?> resetAdminPassword(
            @RequestBody Map<String, String> request) {

        String email = request.get("email");
        String newPassword = request.get("newPassword");
        String confirmPassword = request.get("confirmPassword");

        if (isBlank(email)
                || isBlank(newPassword)
                || isBlank(confirmPassword)) {
            return error(HttpStatus.BAD_REQUEST,
                    "Email and both password fields are required.");
        }

        email = email.trim().toLowerCase();

        if (newPassword.length() < 8) {
            return error(HttpStatus.BAD_REQUEST,
                    "Password must contain at least 8 characters.");
        }

        if (!newPassword.equals(confirmPassword)) {
            return error(HttpStatus.BAD_REQUEST,
                    "Passwords do not match.");
        }

        Optional<User> account = findUserByEmail(email);

        if (account.isEmpty()
                || !"ADMIN".equalsIgnoreCase(
                        normalizeRole(account.get().getRole()))) {
            return error(HttpStatus.BAD_REQUEST,
                    "No Admin account was found for this email.");
        }

        User admin = account.get();
        admin.setPassword(newPassword);
        userService.save(admin);

        return ResponseEntity.ok(
                Map.of("message",
                        "Admin password updated. You can now log in.")
        );
    }

    // PLACEMENT OFFICER PASSWORD RESET
    @Transactional
    @PostMapping("/staff-reset-password")
    public ResponseEntity<?> resetStaffPassword(
            @RequestBody Map<String, String> request) {

        String email = request.get("email");
        String newPassword = request.get("newPassword");
        String confirmPassword = request.get("confirmPassword");

        if (isBlank(email)
                || isBlank(newPassword)
                || isBlank(confirmPassword)) {
            return error(HttpStatus.BAD_REQUEST,
                    "Email and both password fields are required.");
        }

        email = email.trim().toLowerCase();

        if (newPassword.length() < 8) {
            return error(HttpStatus.BAD_REQUEST,
                    "Password must contain at least 8 characters.");
        }

        if (!newPassword.equals(confirmPassword)) {
            return error(HttpStatus.BAD_REQUEST,
                    "Passwords do not match.");
        }

        Optional<User> account = findUserByEmail(email);

        if (account.isEmpty()
                || !"PLACEMENT_OFFICER".equalsIgnoreCase(
                        normalizeRole(account.get().getRole()))) {
            return error(HttpStatus.BAD_REQUEST,
                    "No Placement Officer account was found for this email.");
        }

        User officer = account.get();
        officer.setPassword(newPassword);
        userService.save(officer);

        return ResponseEntity.ok(
                Map.of("message",
                        "Placement Officer password reset successfully.")
        );
    }

    // STUDENT REGISTRATION
    @Transactional
    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody Map<String, String> request) {

        String name = request.get("name");
        String rollNumber = request.get("rollNumber");
        String email = request.get("email");
        String password = request.get("password");
        String confirmPassword = request.get("confirmPassword");
        String branch = request.get("branch");

        if (isBlank(name)
                || isBlank(rollNumber)
                || isBlank(email)
                || isBlank(password)) {
            return error(HttpStatus.BAD_REQUEST,
                    "Name, roll number, email, and password are required.");
        }

        name = name.trim();
        rollNumber = rollNumber.trim();
        email = email.trim().toLowerCase();

        if (!isValidEmail(email)) {
            return error(HttpStatus.BAD_REQUEST,
                    "Enter a valid email address.");
        }

        if (password.length() < 8) {
            return error(HttpStatus.BAD_REQUEST,
                    "Password must contain at least 8 characters.");
        }

        if (confirmPassword != null
                && !password.equals(confirmPassword)) {
            return error(HttpStatus.BAD_REQUEST,
                    "Passwords do not match.");
        }

        if (findUserByEmail(email).isPresent()) {
            return error(HttpStatus.CONFLICT,
                    "This email is already registered.");
        }

        if (findStudentByRollNumber(rollNumber).isPresent()) {
            return error(HttpStatus.CONFLICT,
                    "This roll number is already registered.");
        }

        Student student = new Student();
        student.setName(name);
        student.setRollNumber(rollNumber);
        student.setEmail(email);
        student.setBranch(isBlank(branch) ? null : branch.trim());

        studentService.createStudent(student);

        User newUser = new User();
        newUser.setUsername(rollNumber);
        newUser.setEmail(email);
        newUser.setPassword(password);
        newUser.setRole("STUDENT");

        userService.save(newUser);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                Map.of("message",
                        "Account created successfully. You can now log in.")
        );
    }

    // STUDENT PASSWORD RESET
    @Transactional
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(
            @RequestBody Map<String, String> request) {

        String rollNumber = request.get("rollNumber");
        String email = request.get("email");
        String newPassword = request.get("newPassword");
        String confirmPassword = request.get("confirmPassword");

        if (isBlank(rollNumber)
                || isBlank(email)
                || isBlank(newPassword)) {
            return error(HttpStatus.BAD_REQUEST,
                    "Roll number, registered email, and new password are required.");
        }

        rollNumber = rollNumber.trim();
        email = email.trim().toLowerCase();

        if (newPassword.length() < 8) {
            return error(HttpStatus.BAD_REQUEST,
                    "Password must contain at least 8 characters.");
        }

        if (confirmPassword != null
                && !newPassword.equals(confirmPassword)) {
            return error(HttpStatus.BAD_REQUEST,
                    "Passwords do not match.");
        }

        Optional<Student> student =
                findStudentByRollNumber(rollNumber);

        if (student.isEmpty()
                || isBlank(student.get().getEmail())
                || !student.get().getEmail().trim()
                        .equalsIgnoreCase(email)) {
            return error(HttpStatus.BAD_REQUEST,
                    "Roll number and registered email do not match.");
        }

        Optional<User> account =
                findUserByEmail(student.get().getEmail());

        if (account.isEmpty()
                || !"STUDENT".equalsIgnoreCase(
                        account.get().getRole())
                || isBlank(account.get().getUsername())
                || !rollNumber.equalsIgnoreCase(
                        account.get().getUsername().trim())) {
            return error(HttpStatus.BAD_REQUEST,
                    "The student login account could not be found.");
        }

        User user = account.get();
        user.setPassword(newPassword);
        userService.save(user);

        return ResponseEntity.ok(
                Map.of("message",
                        "Password reset successfully. You can now log in.")
        );
    }

    // COMMON USER RESPONSE
    private Map<String, Object> userResponse(User user) {
        Map<String, Object> result = new LinkedHashMap<>();

        result.put("id", user.getId());
        result.put("username", user.getUsername());
        result.put("email", user.getEmail());
        result.put("role", normalizeRole(user.getRole()));

        return result;
    }

    // NORMALIZE ROLE
    private String normalizeRole(String role) {
        if (role == null) {
            return "";
        }

        return role.trim()
                .toUpperCase()
                .replace(' ', '_')
                .replace('-', '_');
    }

    // CHECK EMPTY VALUES
    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    // COMMON ERROR RESPONSE
    private ResponseEntity<?> error(
            HttpStatus status, String message) {
        return ResponseEntity.status(status)
                .body(Map.of("message", message));
    }
}
