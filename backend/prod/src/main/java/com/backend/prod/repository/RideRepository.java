package com.backend.prod.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.backend.prod.entity.Ride;
import com.backend.prod.entity.User;

import java.time.LocalDateTime;
import java.util.List;

public interface RideRepository extends JpaRepository<Ride, Long> {

    // Exact match search
    List<Ride> findBySourceAndDestinationAndStatusAndDepartureTimeAfterAndAvailableSeatsGreaterThan(
            String source, String destination, String status, LocalDateTime time, int seats);

    // Get all active rides with available seats
    List<Ride> findByStatusAndDepartureTimeAfterAndAvailableSeatsGreaterThan(
            String status, LocalDateTime time, int seats);

    // Get rides by driver
    List<Ride> findByDriver(User driver);
    boolean existsByDriverAndStatusIn(User driver, List<String> statuses);

    List<Ride> findByStatusInAndDepartureTimeAfter(List<String> statuses, LocalDateTime after);


    // Flexible search with case-insensitive partial matching
    @Query("SELECT r FROM Ride r WHERE " +
           "LOWER(r.source) LIKE %:source% AND " +
           "LOWER(r.destination) LIKE %:destination% AND " +
           "r.status = 'ACTIVE' AND " +
           "r.departureTime > :now AND " +
           "r.availableSeats > 0")
    List<Ride> findActiveRidesBySourceAndDestination(
            @Param("source") String source,
            @Param("destination") String destination,
            @Param("now") LocalDateTime now);
}
