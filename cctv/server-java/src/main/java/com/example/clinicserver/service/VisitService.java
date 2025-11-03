package com.example.clinicserver.service;

import com.example.clinicserver.model.Visit;
import com.example.clinicserver.repo.VisitRepository;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Page;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class VisitService {
    private final VisitRepository repo;

    public VisitService(VisitRepository repo) {
        this.repo = repo;
    }

    public Visit createVisit(Visit req) {
        String now = Instant.now().toString();
        Visit v = new Visit(
                req.getName(),
                req.getId(),
                req.getSymptoms(),
                now,
                null,
                req.getLoggedBy()
        );
        return repo.save(v);
    }

    public Visit markExit(String id) {
        return repo.findFirstByIdAndExitTimeIsNullOrderByEntryTimeDesc(id)
                .map(v -> {
                    v.setExitTime(Instant.now().toString());
                    return repo.save(v);
                })
                .orElse(null);
    }

    public List<Visit> recent(int limit) {
        if (limit <= 0) limit = 5;
        Pageable p = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "entryTime"));
        Page<Visit> page = repo.findAll(p);
        return page.getContent();
    }

    public List<Visit> byStudent(String id) {
        if (id == null) return List.of();
        return repo.findByIdOrderByEntryTimeDesc(id);
    }

    public List<String> activeIds() {
        List<Visit> active = repo.findByExitTimeIsNullOrExitTime("");
        Set<String> ids = active.stream().map(Visit::getId).collect(Collectors.toSet());
        return ids.stream().sorted().collect(Collectors.toList());
    }

    public List<Visit> activeVisits() {
        return repo.findByExitTimeIsNullOrExitTime("");
    }
}
