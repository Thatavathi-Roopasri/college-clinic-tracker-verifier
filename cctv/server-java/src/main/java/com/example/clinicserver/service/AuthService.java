package com.example.clinicserver.service;

import com.example.clinicserver.model.User;
import com.example.clinicserver.repo.UserRepository;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Locale;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User signup(String name, String email, String password, String role) {
        if (name == null || email == null || password == null || role == null)
            throw new IllegalArgumentException("name, email, password and role are required");
        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
        if (!normalizedEmail.endsWith("@klh.edu.in"))
            throw new IllegalArgumentException("Only @klh.edu.in email addresses are allowed");
        userRepository.findByEmail(normalizedEmail).ifPresent(u -> {
            throw new DuplicateKeyException("Account already exists");
        });
        String hash = encoder.encode(password);
        User saved = userRepository.save(new User(normalizedEmail, hash, role, name.trim()));
        saved.setPassword(null);
        return saved;
    }

    public User login(String email, String password, String role) {
        if (email == null || password == null || role == null)
            throw new IllegalArgumentException("email, password and role are required");
        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
        Optional<User> existing = userRepository.findByEmail(normalizedEmail);
        if (existing.isEmpty()) return null;
        User u = existing.get();
        if (!u.getRole().equalsIgnoreCase(role)) return null;
        if (!encoder.matches(password, u.getPassword())) return null;
        u.setPassword(null);
        return u;
    }

    public int seedStudents() {
        // Create 10 accounts: 2410030001..2410030010
        AtomicInteger created = new AtomicInteger(0);
        for (int i = 1; i <= 10; i++) {
            String suffix = String.format("%03d", i);
            String userId = "2410030" + suffix;
            String email = userId + "@klh.edu.in";
            String password = userId; // as requested
            String normalizedEmail = email.toLowerCase(Locale.ROOT);
            if (userRepository.findByEmail(normalizedEmail).isEmpty()) {
                String hash = encoder.encode(password);
                userRepository.save(new User(normalizedEmail, hash, "student", "Student " + suffix));
                created.incrementAndGet();
            }
        }
        return created.get();
    }

    public boolean resetPassword(String email, String newPassword) {
        if (email == null || newPassword == null) return false;
        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
        Optional<User> existing = userRepository.findByEmail(normalizedEmail);
        if (existing.isEmpty()) return false;
        User u = existing.get();
        u.setPassword(encoder.encode(newPassword));
        userRepository.save(u);
        return true;
    }
}
