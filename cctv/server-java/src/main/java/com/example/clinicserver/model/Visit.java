package com.example.clinicserver.model;

import jakarta.validation.constraints.NotBlank;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("visits")
public class Visit {
    @Id
    private String _id;
    @NotBlank
    private String name;
    @NotBlank
    @Indexed
    private String id;
    private String symptoms;
    private String entryTime; // ISO string
    private String exitTime;  // ISO string or empty
    private String loggedBy;

    public Visit() {}

    public Visit(String name, String id, String symptoms, String entryTime, String exitTime, String loggedBy) {
        this.name = name;
        this.id = id;
        this.symptoms = symptoms;
        this.entryTime = entryTime;
        this.exitTime = exitTime;
        this.loggedBy = loggedBy;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSymptoms() { return symptoms; }
    public void setSymptoms(String symptoms) { this.symptoms = symptoms; }

    public String getEntryTime() { return entryTime; }
    public void setEntryTime(String entryTime) { this.entryTime = entryTime; }

    public String getExitTime() { return exitTime; }
    public void setExitTime(String exitTime) { this.exitTime = exitTime; }

    public String getLoggedBy() { return loggedBy; }
    public void setLoggedBy(String loggedBy) { this.loggedBy = loggedBy; }
}
