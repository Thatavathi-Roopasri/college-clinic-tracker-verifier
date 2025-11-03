package com.example.clinicserver.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "sections")
public class Section {

    @Id
    private String id;
    private String name;
    private List<String> rolls = new ArrayList<>();

    public Section() {}

    public Section(String name) {
        this.name = name;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<String> getRolls() {
        return rolls;
    }

    public void setRolls(List<String> rolls) {
        this.rolls = rolls;
    }

    public void addRoll(String roll) {
        if (roll == null || roll.isBlank()) return;
        if (!this.rolls.contains(roll)) this.rolls.add(roll);
    }
}
