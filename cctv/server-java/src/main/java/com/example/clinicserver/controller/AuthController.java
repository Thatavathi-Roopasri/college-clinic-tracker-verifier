package com.example.clinicserver.controller;

import com.example.clinicserver.model.User;
import com.example.clinicserver.service.AuthService;
import com.example.clinicserver.repo.UserRepository;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private record SignupRequest(@NotBlank String name, @Email String email, @NotBlank String password, @NotBlank String role) {}
    private record LoginRequest(@Email String email, @NotBlank String password, @NotBlank String role) {}
    private record ResetRequest(@Email String email, @NotBlank String newPassword) {}

    private final AuthService authService;
    private final UserRepository userRepository;

    public AuthController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    @GetMapping("/test-users")
    public ResponseEntity<?> testUsers() {
        List<User> users = userRepository.findAll();
        Map<String, Object> response = new HashMap<>();
        response.put("total", users.size());
        response.put("users", users.stream().map(u -> Map.of(
            "email", u.getEmail(),
            "role", u.getRole(),
            "name", u.getName(),
            "password", u.getPassword().substring(0, 20) + "..." // Show first 20 chars of hashed password
        )).toList());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/seed-students")
    public Map<String, Object> seed() {
        int created = authService.seedStudents();
        Map<String, Object> m = new HashMap<>();
        m.put("created", created);
        return m;
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> reset(@RequestBody ResetRequest req) {
        boolean ok = authService.resetPassword(req.email(), req.newPassword());
        if (!ok) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error("Email not found"));
        return ResponseEntity.ok(Map.of("status", "updated"));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest req) {
        try {
            User u = authService.signup(req.name(), req.email(), req.password(), req.role());
            return ResponseEntity.status(HttpStatus.CREATED).body(u);
        } catch (DuplicateKeyException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error("Account already exists"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        try {
            User u = authService.login(req.email(), req.password(), req.role());
            if (u == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error("Invalid credentials"));
            return ResponseEntity.ok(u);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        }
    }

    // Helpful GET handler so opening the POST-only URL in a browser doesn't show the Whitelabel 405
    @GetMapping("/login")
    public ResponseEntity<?> loginInfo() {
        Map<String, Object> m = new HashMap<>();
        m.put("message", "This endpoint accepts POST requests with JSON body: { \"email\":..., \"password\":..., \"role\":... }.");
        m.put("note", "Do NOT open this URL in a browser expecting to authenticate — use POST (fetch/curl/Postman).");
        return ResponseEntity.ok(m);
    }

    private Map<String, Object> error(String msg) {
        Map<String, Object> m = new HashMap<>();
        m.put("error", msg);
        return m;
    }
}
