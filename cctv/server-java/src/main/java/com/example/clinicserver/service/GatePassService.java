package com.example.clinicserver.service;

import com.example.clinicserver.model.GatePass;
import com.example.clinicserver.repo.GatePassRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class GatePassService {
    
    @Autowired
    private GatePassRepository gatePassRepository;

    // Create a new gate pass
    public GatePass createGatePass(GatePass gatePass) {
        return gatePassRepository.save(gatePass);
    }

    // Get all gate passes
    public List<GatePass> getAllGatePasses() {
        return gatePassRepository.findAll();
    }

    // Get gate pass by ID
    public Optional<GatePass> getGatePassById(String id) {
        return gatePassRepository.findById(id);
    }

    // Get gate pass by pass number
    public Optional<GatePass> getGatePassByNumber(String passNumber) {
        return gatePassRepository.findByPassNumber(passNumber);
    }

    // Get gate passes for a user
    public List<GatePass> getGatePassesByUser(String userId) {
        return gatePassRepository.findByUserId(userId);
    }

    // Get gate passes for a specific portal
    public List<GatePass> getGatePassesByPortal(String portalId) {
        return gatePassRepository.findByPortalId(portalId);
    }

    // Get gate passes for a specific section
    public List<GatePass> getGatePassesBySection(String sectionId) {
        return gatePassRepository.findBySectionId(sectionId);
    }

    // Get gate passes by status
    public List<GatePass> getGatePassesByStatus(String status) {
        return gatePassRepository.findByStatus(status);
    }

    // Get user's gate passes in a specific portal
    public List<GatePass> getUserGatePassesInPortal(String userId, String portalId) {
        return gatePassRepository.findByUserIdAndPortalId(userId, portalId);
    }

    // Get active (non-expired) gate passes
    public List<GatePass> getActiveGatePasses() {
        return gatePassRepository.findByStatusAndExpiresAtAfter("active", LocalDateTime.now());
    }

    // Update gate pass
    public GatePass updateGatePass(String id, GatePass gatePassDetails) {
        Optional<GatePass> optionalGatePass = gatePassRepository.findById(id);
        if (optionalGatePass.isPresent()) {
            GatePass gatePass = optionalGatePass.get();
            if (gatePassDetails.getStatus() != null) gatePass.setStatus(gatePassDetails.getStatus());
            if (gatePassDetails.getExpiresAt() != null) gatePass.setExpiresAt(gatePassDetails.getExpiresAt());
            if (gatePassDetails.getRemarks() != null) gatePass.setRemarks(gatePassDetails.getRemarks());
            return gatePassRepository.save(gatePass);
        }
        return null;
    }

    // Mark gate pass as used
    public GatePass markGatePassAsUsed(String id) {
        Optional<GatePass> optionalGatePass = gatePassRepository.findById(id);
        if (optionalGatePass.isPresent()) {
            GatePass gatePass = optionalGatePass.get();
            gatePass.setStatus("used");
            gatePass.setUsedAt(LocalDateTime.now());
            return gatePassRepository.save(gatePass);
        }
        return null;
    }

    // Revoke gate pass
    public GatePass revokeGatePass(String id, String remarks) {
        Optional<GatePass> optionalGatePass = gatePassRepository.findById(id);
        if (optionalGatePass.isPresent()) {
            GatePass gatePass = optionalGatePass.get();
            gatePass.setStatus("revoked");
            gatePass.setRemarks(remarks);
            return gatePassRepository.save(gatePass);
        }
        return null;
    }

    // Get expired gate passes
    public List<GatePass> getExpiredGatePasses() {
        return gatePassRepository.findByExpiresAtBefore(LocalDateTime.now());
    }

    // Auto-expire gate passes
    public void expireOldGatePasses() {
        List<GatePass> expiredPasses = getExpiredGatePasses();
        for (GatePass pass : expiredPasses) {
            if (!pass.getStatus().equals("expired")) {
                pass.setStatus("expired");
                gatePassRepository.save(pass);
            }
        }
    }

    // Delete gate pass
    public void deleteGatePass(String id) {
        gatePassRepository.deleteById(id);
    }

    // Get pending gate passes for HOD
    public List<GatePass> getPendingGatePassesForHOD(String hodUserId) {
        return gatePassRepository.findByHodUserIdAndStatus(hodUserId, "pending_approval");
    }

    // Approve gate pass
    public GatePass approveGatePass(String id) {
        Optional<GatePass> optionalGatePass = gatePassRepository.findById(id);
        if (optionalGatePass.isPresent()) {
            GatePass gatePass = optionalGatePass.get();
            gatePass.setStatus("approved");  // 🔥 Changed from "active" to "approved"
            gatePass.setApprovedAt(LocalDateTime.now());
            return gatePassRepository.save(gatePass);
        }
        return null;
    }

    // Decline gate pass
    public GatePass declineGatePass(String id, String reason) {
        Optional<GatePass> optionalGatePass = gatePassRepository.findById(id);
        if (optionalGatePass.isPresent()) {
            GatePass gatePass = optionalGatePass.get();
            gatePass.setStatus("declined");
            gatePass.setDeclinedAt(LocalDateTime.now());
            gatePass.setDeclineReason(reason);
            return gatePassRepository.save(gatePass);
        }
        return null;
    }

    // Delete gate pass
    public void deleteGatePass(String id) {
        gatePassRepository.deleteById(id);
    }

    // Clean up all gate passes with GP- prefix (old format)
    public int cleanupOldGatePasses() {
        List<GatePass> all = gatePassRepository.findAll();
        int count = 0;
        for (GatePass gp : all) {
            if (gp.getId() != null && gp.getId().startsWith("GP-")) {
                gatePassRepository.deleteById(gp.getId());
                count++;
            }
        }
        return count;
    }

    // Clean up ALL gate passes
    public int cleanupAllGatePasses() {
        List<GatePass> all = gatePassRepository.findAll();
        gatePassRepository.deleteAll();
        return all.size();
    }
}
