package com.example.clinicserver.repo;

import com.example.clinicserver.model.Portal;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PortalRepository extends MongoRepository<Portal, String> {
    Optional<Portal> findByName(String name);
    Optional<Portal> findByPortalType(String portalType);
    List<Portal> findByActiveTrue();
    List<Portal> findBySectionIdsContaining(String sectionId);
    List<Portal> findByUserIdsContaining(String userId);
}
