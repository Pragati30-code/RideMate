package com.backend.prod.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.backend.prod.entity.Booking;
import com.backend.prod.entity.User;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    List<Booking> findByUser(User user);

    List<Booking> findByRideId(Long rideId);

    List<Booking> findByRideIdAndStatusNot(Long rideId, String status);

    @Query("SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END FROM Booking b " +
           "WHERE b.user = :user AND b.status <> 'CANCELLED' " +
           "AND b.ride.status IN ('ACTIVE','FULL','IN_PROGRESS')")
    boolean hasOngoingRideBooking(@Param("user") User user);

    @Query("SELECT b FROM Booking b WHERE b.user = :user AND b.status <> 'CANCELLED' " +
           "AND b.ride.status IN ('ACTIVE','FULL','IN_PROGRESS') ORDER BY b.id DESC")
    List<Booking> findCurrentBookingsByUser(@Param("user") User user);
}
