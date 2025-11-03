package com.example.clinicserver.seed;

import com.example.clinicserver.model.Portal;
import com.example.clinicserver.model.User;
import com.example.clinicserver.repo.PortalRepository;
import com.example.clinicserver.repo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.List;

@Component
public class SeedDatabase implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PortalRepository portalRepository;

    private PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    public void run(String... args) throws Exception {
        System.out.println("\n[SeedDatabase] Starting seeding process...");
        System.out.flush();
        
        try {
            long userCount = userRepository.count();
            System.out.println("[SeedDatabase] Current user count: " + userCount);
            System.out.flush();
            
            if (userCount == 0) {
                // Create test users
                List<User> users = new ArrayList<>();
                users.add(new User("student@klh.edu.in", passwordEncoder.encode("student123"), "student", "Test Student"));
                users.add(new User("faculty@klh.edu.in", passwordEncoder.encode("faculty123"), "faculty", "Test Faculty"));
                users.add(new User("clinic@klh.edu.in", passwordEncoder.encode("clinic123"), "clinic", "Test Clinic"));
                users.add(new User("hod@klh.edu.in", passwordEncoder.encode("hod123"), "hod", "Test HOD"));
                userRepository.saveAll(users);
                System.out.println("[SeedDatabase] Created " + users.size() + " test users");
            } else {
                System.out.println("[SeedDatabase] Database already has " + userCount + " users. Skipping seeding.");
            }
            System.out.flush();
            System.out.println("[SeedDatabase] Seeding completed successfully!\n");
            System.out.flush();
        } catch (Throwable e) {
            System.err.println("[SeedDatabase] FATAL ERROR: " + e.getClass().getSimpleName());
            System.err.println("[SeedDatabase] Message: " + e.getMessage());
            e.printStackTrace();
            System.err.flush();
            // Don't rethrow - let the app continue
        }
    }

    private void seedUsers() {
        System.out.println("  Clearing existing users...");
        userRepository.deleteAll();
        portalRepository.deleteAll();
        System.out.println("  Creating users...");

        List<User> users = new ArrayList<>();

        // HOD Users
        users.add(new User("hod@klh.edu.in", passwordEncoder.encode("hod123"), "hod", "Head of Department"));
        users.add(new User("hod2@klh.edu.in", passwordEncoder.encode("hod2123"), "hod", "HOD Science"));

        // Faculty Users
        users.add(new User("faculty1@klh.edu.in", passwordEncoder.encode("faculty123"), "faculty", "Dr. Rajesh Kumar"));
        users.add(new User("faculty2@klh.edu.in", passwordEncoder.encode("faculty456"), "faculty", "Dr. Priya Sharma"));
        users.add(new User("doctor@klh.edu.in", passwordEncoder.encode("doctor123"), "faculty", "Dr. Amit Singh"));

        // Clinic Staff
        users.add(new User("clinic_staff@klh.edu.in", passwordEncoder.encode("clinic123"), "clinic", "Clinic Staff Member"));
        users.add(new User("nurse@klh.edu.in", passwordEncoder.encode("nurse123"), "clinic", "Nurse Sharma"));

        // Student Users
        users.add(new User("241003001@klh.edu.in", passwordEncoder.encode("241003001"), "student", "Swathi"));
        users.add(new User("241003002@klh.edu.in", passwordEncoder.encode("241003002"), "student", "Rahul"));
        users.add(new User("student1@klh.edu.in", passwordEncoder.encode("student123"), "student", "Student One"));
        users.add(new User("student2@klh.edu.in", passwordEncoder.encode("student456"), "student", "Student Two"));
        users.add(new User("student3@klh.edu.in", passwordEncoder.encode("student789"), "student", "Student Three"));
        users.add(new User("student4@klh.edu.in", passwordEncoder.encode("student101"), "student", "Student Four"));

        userRepository.saveAll(users);
        System.out.println("    " + users.size() + " users created");
    }

    private void seedPortals() {
        System.out.println("  Creating portals...");

        List<Portal> portals = new ArrayList<>();

        // HOD Portal
        Portal hodPortal = new Portal("HOD Portal", "Head of Department portal", "hod");
        hodPortal.addUserId("hod@klh.edu.in");
        hodPortal.addUserId("hod2@klh.edu.in");
        portals.add(hodPortal);

        // Faculty Portal
        Portal facultyPortal = new Portal("Faculty Portal", "Faculty member portal", "faculty");
        facultyPortal.addUserId("faculty1@klh.edu.in");
        facultyPortal.addUserId("faculty2@klh.edu.in");
        facultyPortal.addUserId("doctor@klh.edu.in");
        portals.add(facultyPortal);

        // Clinic Portal
        Portal clinicPortal = new Portal("Clinic Portal", "Clinic operations portal", "clinic");
        clinicPortal.addUserId("clinic_staff@klh.edu.in");
        clinicPortal.addUserId("nurse@klh.edu.in");
        portals.add(clinicPortal);

        // Student Portal
        Portal studentPortal = new Portal("Student Portal", "Student self-service portal", "student");
        studentPortal.addUserId("241003001@klh.edu.in");
        studentPortal.addUserId("241003002@klh.edu.in");
        studentPortal.addUserId("student1@klh.edu.in");
        studentPortal.addUserId("student2@klh.edu.in");
        studentPortal.addUserId("student3@klh.edu.in");
        studentPortal.addUserId("student4@klh.edu.in");
        portals.add(studentPortal);

        portalRepository.saveAll(portals);
        System.out.println("    " + portals.size() + " portals created");
    }
}
