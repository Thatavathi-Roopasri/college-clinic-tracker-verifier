package com.example.clinicserver.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Map;

@Document(collection = "attendance")
public class Attendance {

    @Id
    private String id;

    private String date; // ISO date string yyyy-MM-dd

    private String section;

    // key: roll number, value: status (e.g., "present" / "absent" / "sick")
    private Map<String, String> records;

    public Attendance() {}

    public Attendance(String date, String section, Map<String, String> records) {
        this.date = date;
        this.section = section;
        this.records = records;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public Map<String, String> getRecords() {
        return records;
    }

    public void setRecords(Map<String, String> records) {
        this.records = records;
    }
}
