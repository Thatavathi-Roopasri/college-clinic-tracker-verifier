package com.example.clinicserver.service;

import com.example.clinicserver.model.Section;
import com.example.clinicserver.repo.SectionRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SectionService {
    private final SectionRepository repo;

    public SectionService(SectionRepository repo) {
        this.repo = repo;
    }

    public List<Section> listAll() {
        return repo.findAll();
    }

    public Section create(String name) {
        if (name == null || name.isBlank()) return null;
        return repo.findByName(name).orElseGet(() -> repo.save(new Section(name)));
    }

    public Section addRoll(String sectionName, String roll) {
        if (sectionName == null || sectionName.isBlank() || roll == null || roll.isBlank()) return null;
        Section s = repo.findByName(sectionName).orElseGet(() -> repo.save(new Section(sectionName)));
        if (!s.getRolls().contains(roll)) {
            s.addRoll(roll);
            repo.save(s);
        }
        return s;
    }

    public Map<String, List<String>> asMap() {
        List<Section> all = repo.findAll();
        Map<String, List<String>> m = new HashMap<>();
        for (Section s : all) m.put(s.getName(), s.getRolls());
        return m;
    }
}
