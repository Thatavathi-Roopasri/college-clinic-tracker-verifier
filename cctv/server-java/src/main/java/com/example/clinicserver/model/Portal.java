package com.example.clinicserver.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "portals")
public class Portal {
    @Id
    private String id;
    
    private String name; // e.g., "Admin Portal", "Student Portal", "Faculty Portal"
    private String description;
    private String portalType; // admin, student, faculty, clinic, hod
    private List<String> sectionIds = new ArrayList<>(); // Sections accessible in this portal
    private List<String> userIds = new ArrayList<>(); // Users with access to this portal
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Portal() {
        this.active = true;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Portal(String name, String description, String portalType) {
        this.name = name;
        this.description = description;
        this.portalType = portalType;
        this.active = true;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPortalType() { return portalType; }
    public void setPortalType(String portalType) { this.portalType = portalType; }

    public List<String> getSectionIds() { return sectionIds; }
    public void setSectionIds(List<String> sectionIds) { this.sectionIds = sectionIds; }

    public void addSectionId(String sectionId) {
        if (sectionId != null && !sectionId.isBlank() && !this.sectionIds.contains(sectionId)) {
            this.sectionIds.add(sectionId);
        }
    }

    public void removeSectionId(String sectionId) {
        this.sectionIds.remove(sectionId);
    }

    public List<String> getUserIds() { return userIds; }
    public void setUserIds(List<String> userIds) { this.userIds = userIds; }

    public void addUserId(String userId) {
        if (userId != null && !userId.isBlank() && !this.userIds.contains(userId)) {
            this.userIds.add(userId);
        }
    }

    public void removeUserId(String userId) {
        this.userIds.remove(userId);
    }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
