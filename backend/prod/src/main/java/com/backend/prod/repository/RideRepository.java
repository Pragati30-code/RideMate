package com.backend.prod.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.backend.prod.entity.Ride;

public interface RideRepository extends JpaRepository<Ride, Long> {
}
