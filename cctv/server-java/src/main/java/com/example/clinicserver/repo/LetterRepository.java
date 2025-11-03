package com.example.clinicserver.repo;

import com.example.clinicserver.model.Letter;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface LetterRepository extends MongoRepository<Letter, String> {
    Optional<Letter> findByLetterNumber(String letterNumber);
    List<Letter> findByUserId(String userId);
    List<Letter> findByPortalId(String portalId);
    List<Letter> findBySectionId(String sectionId);
    List<Letter> findByStatus(String status);
    List<Letter> findByLetterType(String letterType);
    List<Letter> findByUserIdAndPortalId(String userId, String portalId);
    List<Letter> findByIssuerUserId(String issuerUserId);
    List<Letter> findByExpiresAtBefore(LocalDateTime dateTime);
    List<Letter> findByStatusAndExpiresAtAfter(String status, LocalDateTime dateTime);
}
