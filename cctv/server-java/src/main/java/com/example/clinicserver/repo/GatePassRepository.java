package com.example.clinicserver.repo;

import com.example.clinicserver.model.GatePass;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface GatePassRepository extends MongoRepository<GatePass, String> {
    Optional<GatePass> findByPassNumber(String passNumber);
    List<GatePass> findByUserId(String userId);
    List<GatePass> findByPortalId(String portalId);
    List<GatePass> findBySectionId(String sectionId);
    List<GatePass> findByStatus(String status);
    List<GatePass> findByUserIdAndPortalId(String userId, String portalId);
    List<GatePass> findByExpiresAtBefore(LocalDateTime dateTime);
    List<GatePass> findByStatusAndExpiresAtAfter(String status, LocalDateTime dateTime);
    List<GatePass> findByHodUserIdAndStatus(String hodUserId, String status);
    List<GatePass> findByHodSectionIdAndStatus(String hodSectionId, String status);
}
