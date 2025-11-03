package com.example.clinicserver.controller;

import com.example.clinicserver.model.Visit;
import com.example.clinicserver.service.VisitService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ApiController {

    private final VisitService visitService;

    public ApiController(VisitService visitService) {
        this.visitService = visitService;
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> m = new HashMap<>();
        m.put("status", "OK");
        return m;
    }

    @PostMapping("/visits")
    public ResponseEntity<Visit> create(@Valid @RequestBody Visit req) {
        Visit v = visitService.createVisit(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(v);
    }

    @GetMapping("/visits/recent")
    public List<Visit> recent(@RequestParam(defaultValue = "5") int limit) {
        return visitService.recent(limit);
    }

    @GetMapping("/visits/student/{id}")
    public List<Visit> byStudent(@PathVariable String id) {
        return visitService.byStudent(id);
    }

    @PatchMapping("/visits/exit/{id}")
    public ResponseEntity<?> markExit(@PathVariable String id) {
        Visit v = visitService.markExit(id);
        if (v == null) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "No active visit found for this student ID.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
        return ResponseEntity.ok(v);
    }

    @GetMapping("/visits/active-ids")
    public List<String> activeIds() {
        return visitService.activeIds();
    }

    @GetMapping("/visits/active")
    public List<Visit> activeVisits() {
        return visitService.activeVisits();
    }
}
