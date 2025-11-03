package com.example.clinicserver.repo;

import com.example.clinicserver.model.Visit;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface VisitRepository extends MongoRepository<Visit, String> {
    List<Visit> findByIdOrderByEntryTimeDesc(String id);
    Optional<Visit> findFirstByIdAndExitTimeIsNullOrderByEntryTimeDesc(String id);
    List<Visit> findByExitTimeIsNull();
    List<Visit> findByExitTimeIsNullOrExitTime(String exitTime);
    List<Visit> findAllBy(Sort sort);
    // Spring Data provides findAll(Pageable) which returns a Page
}
