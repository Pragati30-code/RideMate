package com.backend.prod.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.backend.prod.entity.Booking;

public interface BookingRepository extends JpaRepository<Booking, Long> {
}
