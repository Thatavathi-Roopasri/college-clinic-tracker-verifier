package com.example.clinicserver.controller;

import com.example.clinicserver.model.Portal;
import com.example.clinicserver.service.PortalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/portals")
@CrossOrigin(origins = "*")
public class PortalController {
    
    @Autowired
    private PortalService portalService;

    @PostMapping
    public ResponseEntity<Portal> createPortal(@RequestBody Portal portal) {
        Portal createdPortal = portalService.createPortal(portal);
        return new ResponseEntity<>(createdPortal, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Portal>> getAllPortals() {
        List<Portal> portals = portalService.getAllPortals();
        return new ResponseEntity<>(portals, HttpStatus.OK);
    }

    @GetMapping("/active")
    public ResponseEntity<List<Portal>> getActivePortals() {
        List<Portal> portals = portalService.getActivePortals();
        return new ResponseEntity<>(portals, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Portal> getPortalById(@PathVariable String id) {
        Optional<Portal> portal = portalService.getPortalById(id);
        return portal.map(p -> new ResponseEntity<>(p, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<Portal> getPortalByName(@PathVariable String name) {
        Optional<Portal> portal = portalService.getPortalByName(name);
        return portal.map(p -> new ResponseEntity<>(p, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/type/{portalType}")
    public ResponseEntity<Portal> getPortalByType(@PathVariable String portalType) {
        Optional<Portal> portal = portalService.getPortalByType(portalType);
        return portal.map(p -> new ResponseEntity<>(p, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/section/{sectionId}")
    public ResponseEntity<List<Portal>> getPortalsBySection(@PathVariable String sectionId) {
        List<Portal> portals = portalService.getPortalsBySection(sectionId);
        return new ResponseEntity<>(portals, HttpStatus.OK);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Portal>> getPortalsByUser(@PathVariable String userId) {
        List<Portal> portals = portalService.getPortalsByUser(userId);
        return new ResponseEntity<>(portals, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Portal> updatePortal(@PathVariable String id, @RequestBody Portal portalDetails) {
        Portal updatedPortal = portalService.updatePortal(id, portalDetails);
        if (updatedPortal != null) {
            return new ResponseEntity<>(updatedPortal, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PostMapping("/{portalId}/sections/{sectionId}")
    public ResponseEntity<Portal> addSectionToPortal(@PathVariable String portalId, @PathVariable String sectionId) {
        Portal portal = portalService.addSectionToPortal(portalId, sectionId);
        if (portal != null) {
            return new ResponseEntity<>(portal, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @DeleteMapping("/{portalId}/sections/{sectionId}")
    public ResponseEntity<Portal> removeSectionFromPortal(@PathVariable String portalId, @PathVariable String sectionId) {
        Portal portal = portalService.removeSectionFromPortal(portalId, sectionId);
        if (portal != null) {
            return new ResponseEntity<>(portal, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PostMapping("/{portalId}/users/{userId}")
    public ResponseEntity<Portal> addUserToPortal(@PathVariable String portalId, @PathVariable String userId) {
        Portal portal = portalService.addUserToPortal(portalId, userId);
        if (portal != null) {
            return new ResponseEntity<>(portal, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @DeleteMapping("/{portalId}/users/{userId}")
    public ResponseEntity<Portal> removeUserFromPortal(@PathVariable String portalId, @PathVariable String userId) {
        Portal portal = portalService.removeUserFromPortal(portalId, userId);
        if (portal != null) {
            return new ResponseEntity<>(portal, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Portal> togglePortalStatus(@PathVariable String id) {
        Portal portal = portalService.togglePortalStatus(id);
        if (portal != null) {
            return new ResponseEntity<>(portal, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePortal(@PathVariable String id) {
        portalService.deletePortal(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
