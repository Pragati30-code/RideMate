package com.backend.prod.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.backend.prod.dto.CreateRideRequest;
import com.backend.prod.dto.SearchRideRequest;
import com.backend.prod.entity.Ride;
import com.backend.prod.service.RideService;

import java.util.List;

@RestController
@RequestMapping("/rides")
@CrossOrigin
public class RideController {

    private final RideService rideService;

    public RideController(RideService rideService) {
        this.rideService = rideService;
    }

    // Create a new ride (only verified drivers)
    @PostMapping
    public Ride createRide(@RequestBody CreateRideRequest request, Authentication auth) {
        return rideService.createRide(auth.getName(), request);
    }

    // Search rides by source and destination
    @PostMapping("/search")
    public List<Ride> searchRides(@RequestBody SearchRideRequest request) {
        return rideService.searchRidesFlexible(request.getSource(), request.getDestination());
    }

    // Get all active rides
    @GetMapping
    public List<Ride> getAllActiveRides() {
        return rideService.getAllActiveRides();
    }

    // Get my created rides
    @GetMapping("/my-rides")
    public List<Ride> getMyRides(Authentication auth) {
        return rideService.getMyRides(auth.getName());
    }

    // Cancel a ride
    @PutMapping("/{rideId}/cancel")
    public Ride cancelRide(@PathVariable Long rideId, Authentication auth) {
        return rideService.cancelRide(rideId, auth.getName());
    }
}