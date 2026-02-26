package com.backend.prod.service;

import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;

import com.backend.prod.entity.Booking;
import com.backend.prod.entity.Ride;
import com.backend.prod.entity.User;
import com.backend.prod.repository.BookingRepository;
import com.backend.prod.repository.RideRepository;
import com.backend.prod.repository.UserRepository;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RideRepository rideRepository;
    private final UserRepository userRepository;

    public BookingService(BookingRepository bookingRepository,
                          RideRepository rideRepository,
                          UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.rideRepository = rideRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Booking createBooking(Long rideId, Long userId, int seats) {

        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (ride.getAvailableSeats() < seats) {
            throw new RuntimeException("Not enough seats available");
        }

        ride.setAvailableSeats(ride.getAvailableSeats() - seats);

        Booking booking = new Booking();
        booking.setRide(ride);
        booking.setUser(user);
        booking.setSeatsBooked(seats);
        booking.setStatus("CONFIRMED");

        return bookingRepository.save(booking);
    }
}
