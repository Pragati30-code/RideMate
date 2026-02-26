package com.backend.prod.controller;

import org.springframework.web.bind.annotation.*;

import com.backend.prod.entity.Booking;
import com.backend.prod.service.BookingService;

@RestController
@RequestMapping("/bookings")
@CrossOrigin
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public Booking createBooking(
            @RequestParam Long rideId,
            @RequestParam Long userId,
            @RequestParam int seats) {

        return bookingService.createBooking(rideId, userId, seats);
    }
}
