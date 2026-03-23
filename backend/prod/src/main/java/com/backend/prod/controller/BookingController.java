package com.backend.prod.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.backend.prod.dto.BookingRequest;
import com.backend.prod.entity.Booking;
import com.backend.prod.service.BookingService;

import java.util.List;

@RestController
@RequestMapping("/bookings")
@CrossOrigin
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
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

    // Cancel booking (passenger)
    @PutMapping("/{bookingId}/cancel")
    public Booking cancelBooking(@PathVariable Long bookingId, Authentication auth) {
        return bookingService.cancelBooking(bookingId, auth.getName());
    }

    // Driver marks passenger as picked up
    @PutMapping("/{bookingId}/pickup")
    public Booking markPickedUp(@PathVariable Long bookingId, Authentication auth) {
        return bookingService.markPickedUp(bookingId, auth.getName());
    }

    // Driver marks passenger as dropped off
    @PutMapping("/{bookingId}/drop")
    public Booking markDropped(@PathVariable Long bookingId, Authentication auth) {
        return bookingService.markDropped(bookingId, auth.getName());
    }
}