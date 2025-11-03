package com.example.clinicserver.service;

import com.example.clinicserver.model.Attendance;
import com.example.clinicserver.repo.AttendanceRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;

    public AttendanceService(AttendanceRepository attendanceRepository) {
        this.attendanceRepository = attendanceRepository;
    }

    public Attendance save(Attendance attendance) {
        return attendanceRepository.save(attendance);
    }

    public List<Attendance> all() {
        return attendanceRepository.findAll();
    }
}
