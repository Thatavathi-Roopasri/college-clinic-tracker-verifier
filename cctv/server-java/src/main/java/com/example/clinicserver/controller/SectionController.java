package com.example.clinicserver.controller;

import com.example.clinicserver.model.Section;
import com.example.clinicserver.service.SectionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sections")
public class SectionController {

    private final SectionService sectionService;

    public SectionController(SectionService sectionService) {
        this.sectionService = sectionService;
    }

    @GetMapping("")
    public List<Section> list() {
        return sectionService.listAll();
    }

    @PostMapping("")
    public ResponseEntity<?> create(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        if (name == null || name.isBlank()) {
            Map<String, String> err = new HashMap<>(); err.put("error", "Missing section name");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }
        Section s = sectionService.create(name.trim());
        return ResponseEntity.status(HttpStatus.CREATED).body(s);
    }

    @PostMapping("/{name}/rolls")
    public ResponseEntity<?> addRoll(@PathVariable String name, @RequestBody Map<String, String> body) {
        String roll = body.get("roll");
        if (roll == null || roll.isBlank()) {
            Map<String, String> err = new HashMap<>(); err.put("error", "Missing roll number");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }
        Section s = sectionService.addRoll(name, roll.trim());
        return ResponseEntity.ok(s);
    }

    @GetMapping("/map")
    public Map<String, List<String>> map() {
        return sectionService.asMap();
    }
}
