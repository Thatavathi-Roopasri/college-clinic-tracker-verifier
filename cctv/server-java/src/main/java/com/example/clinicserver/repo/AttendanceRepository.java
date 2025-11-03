package com.example.clinicserver.repo;

import com.example.clinicserver.model.Attendance;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AttendanceRepository extends MongoRepository<Attendance, String> {
    // additional query methods can be added here if needed
}
