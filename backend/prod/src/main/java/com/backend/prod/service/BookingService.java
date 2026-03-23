package com.backend.prod.service;

import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;

import com.backend.prod.dto.BookingRequest;
import com.backend.prod.entity.Booking;
import com.backend.prod.entity.Ride;
import com.backend.prod.entity.User;
import com.backend.prod.repository.BookingRepository;
import com.backend.prod.repository.RideRepository;
import com.backend.prod.repository.UserRepository;

import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RideRepository rideRepository;
    private final UserRepository userRepository;
    private final RideService rideService;

    public BookingService(BookingRepository bookingRepository,
            RideRepository rideRepository,
            UserRepository userRepository,
            RideService rideService) {
        this.bookingRepository = bookingRepository;
        this.rideRepository = rideRepository;
        this.userRepository = userRepository;
        this.rideService = rideService;
    }

    @Transactional
    public Booking createBooking(BookingRequest request, String email) {
        Ride ride = rideRepository.findById(request.getRideId())
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (ride.getDriver().getId().equals(user.getId())) {
            throw new RuntimeException("You cannot book your own ride");
        }

        String status = ride.getStatus();
        if ("IN_PROGRESS".equals(status) || "COMPLETED".equals(status) || "CANCELLED".equals(status)) {
            throw new RuntimeException("This ride is no longer available for booking");
        }

        if ("FULL".equals(status)) {
            throw new RuntimeException("This ride is full. No seats available.");
        }

        if (ride.getAvailableSeats() < request.getSeats()) {
            throw new RuntimeException(
                    "Not enough seats available. Only " + ride.getAvailableSeats() + " seat(s) left.");
        }

        // Validate that passenger stops were provided
        if (request.getPickupLatitude() == null || request.getPickupLongitude() == null
                || request.getDropLatitude() == null || request.getDropLongitude() == null) {
            throw new RuntimeException("Pickup and drop coordinates are required to calculate fare");
        }

        // Compute fare for passenger's specific segment: pickupCoords → dropCoords
        double segmentKm = rideService.calculateDistanceKm(
                request.getPickupLatitude(), request.getPickupLongitude(),
                request.getDropLatitude(), request.getDropLongitude());
        double estimatedFare = Math.round(segmentKm * RideService.FARE_PER_KM * request.getSeats() * 100.0) / 100.0;

        // Deduct seats and flip to FULL if 0 remaining
        ride.setAvailableSeats(ride.getAvailableSeats() - request.getSeats());
        if (ride.getAvailableSeats() == 0) {
            ride.setStatus("FULL");
        }
        rideRepository.save(ride);

        Booking booking = new Booking();
        booking.setRide(ride);
        booking.setUser(user);
        booking.setSeatsBooked(request.getSeats());
        booking.setStatus("CONFIRMED");

        // Store passenger's stop details
        booking.setPickupName(request.getPickupName());
        booking.setPickupLatitude(request.getPickupLatitude());
        booking.setPickupLongitude(request.getPickupLongitude());
        booking.setDropName(request.getDropName());
        booking.setDropLatitude(request.getDropLatitude());
        booking.setDropLongitude(request.getDropLongitude());

        booking.setSegmentDistanceKm(Math.round(segmentKm * 100.0) / 100.0);
        booking.setEstimatedFare(estimatedFare);

        return bookingRepository.save(booking);
    }

    public List<Booking> getMyBookings(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return bookingRepository.findByUser(user);
    }

    @Transactional
    public Booking cancelBooking(Long bookingId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You can only cancel your own bookings");
        }

        if ("CANCELLED".equals(booking.getStatus())) {
            throw new RuntimeException("Booking is already cancelled");
        }

        if ("DROPPED".equals(booking.getStatus()) || "PICKED_UP".equals(booking.getStatus())) {
            throw new RuntimeException("Cannot cancel a booking that is already in progress or completed");
        }

        // Restore seats
        Ride ride = booking.getRide();
        ride.setAvailableSeats(ride.getAvailableSeats() + booking.getSeatsBooked());

        // If ride was FULL, a seat just freed — flip back to ACTIVE
        if ("FULL".equals(ride.getStatus())) {
            ride.setStatus("ACTIVE");
        }

        rideRepository.save(ride);
        booking.setStatus("CANCELLED");
        return bookingRepository.save(booking);
    }

    @Transactional
    public Booking markPickedUp(Long bookingId, String driverEmail) {
        Booking booking = getBookingAndVerifyDriver(bookingId, driverEmail);

        if (!"CONFIRMED".equals(booking.getStatus())) {
            throw new RuntimeException("Only confirmed bookings can be marked as picked up");
        }

        booking.setStatus("PICKED_UP");
        return bookingRepository.save(booking);
    }

    // Driver marks a specific passenger as dropped off
    @Transactional
    public Booking markDropped(Long bookingId, String driverEmail) {
        Booking booking = getBookingAndVerifyDriver(bookingId, driverEmail);

        if (!"PICKED_UP".equals(booking.getStatus())) {
            throw new RuntimeException("Only picked-up passengers can be marked as dropped");
        }

        booking.setStatus("DROPPED");
        return bookingRepository.save(booking);
    }

    private Booking getBookingAndVerifyDriver(Long bookingId, String driverEmail) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        User driver = userRepository.findByEmail(driverEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!booking.getRide().getDriver().getId().equals(driver.getId())) {
            throw new RuntimeException("Only the ride driver can update passenger status");
        }

        if (!"IN_PROGRESS".equals(booking.getRide().getStatus())) {
            throw new RuntimeException("Ride must be in progress to update passenger status");
        }

        return booking;
    }
}