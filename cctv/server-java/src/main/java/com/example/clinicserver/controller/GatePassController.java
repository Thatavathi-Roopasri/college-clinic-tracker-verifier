package com.example.clinicserver.controller;

import com.example.clinicserver.model.GatePass;
import com.example.clinicserver.service.GatePassService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/gatepasses")
@CrossOrigin(origins = "*")
public class GatePassController {
    
    @Autowired
    private GatePassService gatePassService;

    @PostMapping
    public ResponseEntity<GatePass> createGatePass(@RequestBody GatePass gatePass) {
        GatePass createdGatePass = gatePassService.createGatePass(gatePass);
        return new ResponseEntity<>(createdGatePass, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<GatePass>> getAllGatePasses() {
        List<GatePass> gatePasses = gatePassService.getAllGatePasses();
        return new ResponseEntity<>(gatePasses, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<GatePass> getGatePassById(@PathVariable String id) {
        Optional<GatePass> gatePass = gatePassService.getGatePassById(id);
        return gatePass.map(gp -> new ResponseEntity<>(gp, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/number/{passNumber}")
    public ResponseEntity<GatePass> getGatePassByNumber(@PathVariable String passNumber) {
        Optional<GatePass> gatePass = gatePassService.getGatePassByNumber(passNumber);
        return gatePass.map(gp -> new ResponseEntity<>(gp, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<GatePass>> getGatePassesByUser(@PathVariable String userId) {
        List<GatePass> gatePasses = gatePassService.getGatePassesByUser(userId);
        return new ResponseEntity<>(gatePasses, HttpStatus.OK);
    }

    @GetMapping("/portal/{portalId}")
    public ResponseEntity<List<GatePass>> getGatePassesByPortal(@PathVariable String portalId) {
        List<GatePass> gatePasses = gatePassService.getGatePassesByPortal(portalId);
        return new ResponseEntity<>(gatePasses, HttpStatus.OK);
    }

    @GetMapping("/section/{sectionId}")
    public ResponseEntity<List<GatePass>> getGatePassesBySection(@PathVariable String sectionId) {
        List<GatePass> gatePasses = gatePassService.getGatePassesBySection(sectionId);
        return new ResponseEntity<>(gatePasses, HttpStatus.OK);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<GatePass>> getGatePassesByStatus(@PathVariable String status) {
        List<GatePass> gatePasses = gatePassService.getGatePassesByStatus(status);
        return new ResponseEntity<>(gatePasses, HttpStatus.OK);
    }

    @GetMapping("/active")
    public ResponseEntity<List<GatePass>> getActiveGatePasses() {
        List<GatePass> gatePasses = gatePassService.getActiveGatePasses();
        return new ResponseEntity<>(gatePasses, HttpStatus.OK);
    }

    @GetMapping("/user/{userId}/portal/{portalId}")
    public ResponseEntity<List<GatePass>> getUserGatePassesInPortal(@PathVariable String userId, @PathVariable String portalId) {
        List<GatePass> gatePasses = gatePassService.getUserGatePassesInPortal(userId, portalId);
        return new ResponseEntity<>(gatePasses, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<GatePass> updateGatePass(@PathVariable String id, @RequestBody GatePass gatePassDetails) {
        GatePass updatedGatePass = gatePassService.updateGatePass(id, gatePassDetails);
        if (updatedGatePass != null) {
            return new ResponseEntity<>(updatedGatePass, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PatchMapping("/{id}/use")
    public ResponseEntity<GatePass> markGatePassAsUsed(@PathVariable String id) {
        GatePass gatePass = gatePassService.markGatePassAsUsed(id);
        if (gatePass != null) {
            return new ResponseEntity<>(gatePass, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PatchMapping("/{id}/revoke")
    public ResponseEntity<GatePass> revokeGatePass(@PathVariable String id, @RequestParam(required = false) String remarks) {
        GatePass gatePass = gatePassService.revokeGatePass(id, remarks);
        if (gatePass != null) {
            return new ResponseEntity<>(gatePass, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @GetMapping("/expired/list")
    public ResponseEntity<List<GatePass>> getExpiredGatePasses() {
        List<GatePass> gatePasses = gatePassService.getExpiredGatePasses();
        return new ResponseEntity<>(gatePasses, HttpStatus.OK);
    }

    @PostMapping("/maintenance/expire-old")
    public ResponseEntity<String> expireOldGatePasses() {
        gatePassService.expireOldGatePasses();
        return new ResponseEntity<>("Expired old gate passes", HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGatePass(@PathVariable String id) {
        gatePassService.deleteGatePass(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/hod/{hodUserId}/pending")
    public ResponseEntity<List<GatePass>> getPendingGatePassesForHOD(@PathVariable String hodUserId) {
        List<GatePass> gatePasses = gatePassService.getPendingGatePassesForHOD(hodUserId);
        return new ResponseEntity<>(gatePasses, HttpStatus.OK);
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<GatePass> approveGatePass(@PathVariable String id) {
        GatePass gatePass = gatePassService.approveGatePass(id);
        if (gatePass != null) {
            return new ResponseEntity<>(gatePass, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PatchMapping("/{id}/decline")
    public ResponseEntity<GatePass> declineGatePass(@PathVariable String id, @RequestParam(required = false) String reason) {
        GatePass gatePass = gatePassService.declineGatePass(id, reason);
        if (gatePass != null) {
            return new ResponseEntity<>(gatePass, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @DeleteMapping("/cleanup/old")
    public ResponseEntity<String> cleanupOldGatePasses() {
        int deleted = gatePassService.cleanupOldGatePasses();
        return new ResponseEntity<>("Deleted " + deleted + " old gate passes", HttpStatus.OK);
    }

    @DeleteMapping("/cleanup/all")
    public ResponseEntity<String> cleanupAllGatePasses() {
        int deleted = gatePassService.cleanupAllGatePasses();
        return new ResponseEntity<>("Deleted " + deleted + " gate passes", HttpStatus.OK);
    }
}
