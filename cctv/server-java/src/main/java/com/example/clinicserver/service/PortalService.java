package com.example.clinicserver.service;

import com.example.clinicserver.model.Portal;
import com.example.clinicserver.repo.PortalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PortalService {
    
    @Autowired
    private PortalRepository portalRepository;

    // Create a new portal
    public Portal createPortal(Portal portal) {
        return portalRepository.save(portal);
    }

    // Get all portals
    public List<Portal> getAllPortals() {
        return portalRepository.findAll();
    }

    // Get active portals only
    public List<Portal> getActivePortals() {
        return portalRepository.findByActiveTrue();
    }

    // Get portal by ID
    public Optional<Portal> getPortalById(String id) {
        return portalRepository.findById(id);
    }

    // Get portal by name
    public Optional<Portal> getPortalByName(String name) {
        return portalRepository.findByName(name);
    }

    // Get portal by type
    public Optional<Portal> getPortalByType(String portalType) {
        return portalRepository.findByPortalType(portalType);
    }

    // Get portals for a specific section
    public List<Portal> getPortalsBySection(String sectionId) {
        return portalRepository.findBySectionIdsContaining(sectionId);
    }

    // Get portals accessible by a user
    public List<Portal> getPortalsByUser(String userId) {
        return portalRepository.findByUserIdsContaining(userId);
    }

    // Update portal
    public Portal updatePortal(String id, Portal portalDetails) {
        Optional<Portal> optionalPortal = portalRepository.findById(id);
        if (optionalPortal.isPresent()) {
            Portal portal = optionalPortal.get();
            if (portalDetails.getName() != null) portal.setName(portalDetails.getName());
            if (portalDetails.getDescription() != null) portal.setDescription(portalDetails.getDescription());
            if (portalDetails.getPortalType() != null) portal.setPortalType(portalDetails.getPortalType());
            portal.setUpdatedAt(LocalDateTime.now());
            return portalRepository.save(portal);
        }
        return null;
    }

    // Add section to portal
    public Portal addSectionToPortal(String portalId, String sectionId) {
        Optional<Portal> optionalPortal = portalRepository.findById(portalId);
        if (optionalPortal.isPresent()) {
            Portal portal = optionalPortal.get();
            portal.addSectionId(sectionId);
            portal.setUpdatedAt(LocalDateTime.now());
            return portalRepository.save(portal);
        }
        return null;
    }

    // Remove section from portal
    public Portal removeSectionFromPortal(String portalId, String sectionId) {
        Optional<Portal> optionalPortal = portalRepository.findById(portalId);
        if (optionalPortal.isPresent()) {
            Portal portal = optionalPortal.get();
            portal.removeSectionId(sectionId);
            portal.setUpdatedAt(LocalDateTime.now());
            return portalRepository.save(portal);
        }
        return null;
    }

    // Add user to portal
    public Portal addUserToPortal(String portalId, String userId) {
        Optional<Portal> optionalPortal = portalRepository.findById(portalId);
        if (optionalPortal.isPresent()) {
            Portal portal = optionalPortal.get();
            portal.addUserId(userId);
            portal.setUpdatedAt(LocalDateTime.now());
            return portalRepository.save(portal);
        }
        return null;
    }

    // Remove user from portal
    public Portal removeUserFromPortal(String portalId, String userId) {
        Optional<Portal> optionalPortal = portalRepository.findById(portalId);
        if (optionalPortal.isPresent()) {
            Portal portal = optionalPortal.get();
            portal.removeUserId(userId);
            portal.setUpdatedAt(LocalDateTime.now());
            return portalRepository.save(portal);
        }
        return null;
    }

    // Toggle portal active status
    public Portal togglePortalStatus(String portalId) {
        Optional<Portal> optionalPortal = portalRepository.findById(portalId);
        if (optionalPortal.isPresent()) {
            Portal portal = optionalPortal.get();
            portal.setActive(!portal.isActive());
            portal.setUpdatedAt(LocalDateTime.now());
            return portalRepository.save(portal);
        }
        return null;
    }

    // Delete portal
    public void deletePortal(String id) {
        portalRepository.deleteById(id);
    }
}
