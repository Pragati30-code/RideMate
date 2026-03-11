package com.backend.prod.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.prod.entity.Booking;
import com.backend.prod.entity.User;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    List<Booking> findByUser(User user);
}
