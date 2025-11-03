package com.example.clinicserver.controller;

import com.example.clinicserver.model.Attendance;
import com.example.clinicserver.service.AttendanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @PostMapping
    public ResponseEntity<Attendance> postAttendance(@RequestBody Attendance attendance) {
        Attendance saved = attendanceService.save(attendance);
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<List<Attendance>> getAll() {
        return ResponseEntity.ok(attendanceService.all());
    }
}
