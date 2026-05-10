package com.backend.prod.controller;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.backend.prod.dto.BookingRequest;
import com.backend.prod.dto.PickupOtpRequest;
import com.backend.prod.dto.RazorpayOrderResponse;
import com.backend.prod.dto.RazorpayVerifyRequest;
import com.backend.prod.entity.Booking;
import com.backend.prod.service.BookingService;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bookings")
@CrossOrigin
public class BookingController {

    private final BookingService bookingService;
    private final SimpMessagingTemplate messagingTemplate;

    public BookingController(BookingService bookingService,
                             SimpMessagingTemplate messagingTemplate) {
        this.bookingService = bookingService;
        this.messagingTemplate = messagingTemplate;
    }

    // Book a ride — request must include pickupLatitude/Longitude and dropLatitude/Longitude
    @PostMapping
    public Booking createBooking(@RequestBody BookingRequest request, Authentication auth) {
        return bookingService.createBooking(request, auth.getName());
    }

    // Get my bookings
    @GetMapping("/my-bookings")
    public List<Booking> getMyBookings(Authentication auth) {
        return bookingService.getMyBookings(auth.getName());
    }

    @GetMapping("/my-current")
    public ResponseEntity<Booking> getMyCurrentBooking(Authentication auth) {
        Booking booking = bookingService.getMyCurrentBooking(auth.getName());
        if (booking == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(booking);
    }

    // Driver gets bookings for one of their own rides
    @GetMapping("/driver/ride/{rideId}")
    public List<Booking> getBookingsForDriverRide(@PathVariable Long rideId, Authentication auth) {
        return bookingService.getBookingsForDriverRide(rideId, auth.getName());
    }

    @GetMapping("/ride/{rideId}/participants")
    public List<Booking> getBookingsForRideParticipant(@PathVariable Long rideId, Authentication auth) {
        return bookingService.getBookingsForRideParticipant(rideId, auth.getName());
    }

    // Cancel booking (passenger)
    @PutMapping("/{bookingId}/cancel")
    public Booking cancelBooking(@PathVariable Long bookingId, Authentication auth) {
        return bookingService.cancelBooking(bookingId, auth.getName());
    }

    // Driver marks passenger as picked up
    @PutMapping("/{bookingId}/pickup")
    public Booking markPickedUp(@PathVariable Long bookingId,
            @RequestBody PickupOtpRequest request,
            Authentication auth) {
        Booking booking = bookingService.markPickedUp(bookingId, auth.getName(),
                request != null ? request.getOtp() : null);
        broadcastBookingStatus(booking);
        return booking;
    }

    // Driver marks passenger as dropped off
    @PutMapping("/{bookingId}/drop")
    public Booking markDropped(@PathVariable Long bookingId, Authentication auth) {
        Booking booking = bookingService.markDropped(bookingId, auth.getName());
        broadcastBookingStatus(booking);
        return booking;
    }

    @PostMapping("/{bookingId}/payments/razorpay/order")
    public RazorpayOrderResponse createRazorpayOrder(@PathVariable Long bookingId, Authentication auth) {
        return bookingService.createRazorpayOrder(bookingId, auth.getName());
    }

    @PostMapping("/{bookingId}/payments/razorpay/verify")
    public Booking verifyRazorpayPayment(@PathVariable Long bookingId,
            @RequestBody RazorpayVerifyRequest request,
            Authentication auth) {
        return bookingService.verifyRazorpayPayment(bookingId, auth.getName(), request);
    }

    private void broadcastBookingStatus(Booking booking) {
        if (booking == null || booking.getRide() == null) return;
        Long rideId = booking.getRide().getId();
        Map<String, Object> event = Map.of(
                "bookingId", booking.getId(),
                "rideId", rideId,
                "status", booking.getStatus(),
                "ts", System.currentTimeMillis()
        );
        messagingTemplate.convertAndSend("/topic/rides/" + rideId + "/bookings", event);
    }
}
