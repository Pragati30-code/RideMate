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

    // Book a ride
    @PostMapping
    public Booking createBooking(@RequestBody BookingRequest request, Authentication auth) {
        return bookingService.createBooking(request.getRideId(), auth.getName(), request.getSeats());
    }

    // Get my bookings
    @GetMapping("/my-bookings")
    public List<Booking> getMyBookings(Authentication auth) {
        return bookingService.getMyBookings(auth.getName());
    }

    // Cancel booking
    @PutMapping("/{bookingId}/cancel")
    public Booking cancelBooking(@PathVariable Long bookingId, Authentication auth) {
        return bookingService.cancelBooking(bookingId, auth.getName());
    }
}
