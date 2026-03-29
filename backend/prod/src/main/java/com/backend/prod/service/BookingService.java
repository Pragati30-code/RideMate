package com.backend.prod.service;

import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;

import com.backend.prod.dto.BookingRequest;
import com.backend.prod.dto.RazorpayOrderResponse;
import com.backend.prod.dto.RazorpayVerifyRequest;
import com.backend.prod.entity.Booking;
import com.backend.prod.entity.Ride;
import com.backend.prod.entity.User;
import com.backend.prod.repository.BookingRepository;
import com.backend.prod.repository.RideRepository;
import com.backend.prod.repository.UserRepository;

import java.util.List;
import java.util.Objects;
import java.time.LocalDateTime;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RideRepository rideRepository;
    private final UserRepository userRepository;
    private final RideService rideService;
    private final RazorpayService razorpayService;

    public BookingService(BookingRepository bookingRepository,
            RideRepository rideRepository,
            UserRepository userRepository,
            RideService rideService,
            RazorpayService razorpayService) {
        this.bookingRepository = bookingRepository;
        this.rideRepository = rideRepository;
        this.userRepository = userRepository;
        this.rideService = rideService;
        this.razorpayService = razorpayService;
    }

    @Transactional
    public Booking createBooking(BookingRequest request, String email) {
        Ride ride = rideRepository.findById(Objects.requireNonNull(request.getRideId(), "rideId is required"))
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (bookingRepository.hasOngoingRideBooking(user)) {
            throw new RuntimeException("You can only have one active booking at a time until that ride ends");
        }

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
        booking.setPaymentStatus("UNPAID");

        return bookingRepository.save(booking);
    }

    public List<Booking> getMyBookings(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return bookingRepository.findByUser(user);
    }

    public List<Booking> getBookingsForDriverRide(Long rideId, String driverEmail) {
        User driver = userRepository.findByEmail(driverEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Ride ride = rideRepository.findById(Objects.requireNonNull(rideId, "rideId is required"))
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        if (!ride.getDriver().getId().equals(driver.getId())) {
            throw new RuntimeException("You can only view bookings for your own rides");
        }

        return bookingRepository.findByRideId(rideId);
    }

    public Booking getMyCurrentBooking(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Booking> currentBookings = bookingRepository.findCurrentBookingsByUser(user);
        if (currentBookings.isEmpty()) {
            return null;
        }
        return currentBookings.get(0);
    }

    public List<Booking> getBookingsForRideParticipant(Long rideId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Ride ride = rideRepository.findById(Objects.requireNonNull(rideId, "rideId is required"))
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        boolean isDriver = ride.getDriver().getId().equals(user.getId());
        boolean isPassenger = bookingRepository.findByRideIdAndStatusNot(rideId, "CANCELLED")
                .stream()
                .anyMatch(booking -> booking.getUser() != null && booking.getUser().getId().equals(user.getId()));

        if (!isDriver && !isPassenger) {
            throw new RuntimeException("You can only view bookings for rides you are part of");
        }

        return bookingRepository.findByRideIdAndStatusNot(rideId, "CANCELLED");
    }

    @Transactional
    public Booking cancelBooking(Long bookingId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Booking booking = bookingRepository.findById(Objects.requireNonNull(bookingId, "bookingId is required"))
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

        if ("PAID".equals(booking.getPaymentStatus())) {
            booking.setPaymentStatus("REFUND_INITIATED");
        }

        booking.setStatus("CANCELLED");
        return bookingRepository.save(booking);
    }

    public RazorpayOrderResponse createRazorpayOrder(Long bookingId, String email) {
        Booking booking = getBookingAndVerifyPassenger(bookingId, email);

        if (!"DROPPED".equals(booking.getStatus())) {
            throw new RuntimeException("Payment can only be started after passenger ride is ended");
        }

        if ("PAID".equals(booking.getPaymentStatus())) {
            throw new RuntimeException("Booking is already paid");
        }

        if (booking.getEstimatedFare() == null || booking.getEstimatedFare() <= 0) {
            throw new RuntimeException("Invalid fare amount for payment");
        }

        long amountInPaise = Math.round(booking.getEstimatedFare() * 100.0);
        RazorpayOrderResponse order = razorpayService.createOrder(amountInPaise, String.valueOf(booking.getId()));

        booking.setPaymentProvider("RAZORPAY");
        booking.setPaymentOrderId(order.getOrderId());
        booking.setPaymentStatus("UNPAID");
        bookingRepository.save(booking);

        return order;
    }

    @Transactional
    public Booking verifyRazorpayPayment(Long bookingId, String email, RazorpayVerifyRequest request) {
        Booking booking = getBookingAndVerifyPassenger(bookingId, email);

        if (!"DROPPED".equals(booking.getStatus())) {
            throw new RuntimeException("Payment can only be completed after passenger ride is ended");
        }

        if ("PAID".equals(booking.getPaymentStatus())) {
            return booking;
        }

        if (request == null || request.getRazorpayOrderId() == null || request.getRazorpayOrderId().isBlank()
                || request.getRazorpayPaymentId() == null || request.getRazorpayPaymentId().isBlank()
                || request.getRazorpaySignature() == null || request.getRazorpaySignature().isBlank()) {
            throw new RuntimeException("Missing Razorpay payment verification fields");
        }

        if (booking.getPaymentOrderId() == null || !booking.getPaymentOrderId().equals(request.getRazorpayOrderId())) {
            throw new RuntimeException("Invalid Razorpay order for this booking");
        }

        boolean valid = razorpayService.verifySignature(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature());

        if (!valid) {
            throw new RuntimeException("Invalid Razorpay signature");
        }

        booking.setPaymentProvider("RAZORPAY");
        booking.setPaymentId(request.getRazorpayPaymentId());
        booking.setPaymentSignature(request.getRazorpaySignature());
        booking.setPaymentStatus("PAID");
        booking.setPaidAt(LocalDateTime.now());
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
        Booking booking = bookingRepository.findById(Objects.requireNonNull(bookingId, "bookingId is required"))
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

    private Booking getBookingAndVerifyPassenger(Long bookingId, String passengerEmail) {
        User passenger = userRepository.findByEmail(passengerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Booking booking = bookingRepository.findById(Objects.requireNonNull(bookingId, "bookingId is required"))
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getUser().getId().equals(passenger.getId())) {
            throw new RuntimeException("You can only pay for your own booking");
        }

        return booking;
    }
}