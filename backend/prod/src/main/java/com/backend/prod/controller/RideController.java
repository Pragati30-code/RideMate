package com.backend.prod.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.backend.prod.dto.CreateRideRequest;
import com.backend.prod.dto.RideSearchResult;
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

    /**
     * Search rides by proximity.
     * Returns List<RideSearchResult> — each item contains the ride + estimatedFare
     * + segmentDistanceKm for this passenger's specific pickup→drop segment.
     *
     * Request body must include:
     *   sourceLatitude, sourceLongitude       — passenger's pickup
     *   destinationLatitude, destinationLongitude — passenger's drop
     *   source, destination (strings)         — for display only, not used for matching
     */
    @PostMapping("/search")
    public List<RideSearchResult> searchRides(@RequestBody SearchRideRequest request) {
        return rideService.searchRidesWithFare(
                request.getSourceLatitude(),
                request.getSourceLongitude(),
                request.getDestinationLatitude(),
                request.getDestinationLongitude()
        );
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

    // Cancel a ride (ACTIVE or FULL only)
    @PutMapping("/{rideId}/cancel")
    public Ride cancelRide(@PathVariable Long rideId, Authentication auth) {
        return rideService.cancelRide(rideId, auth.getName());
    }

    // Driver starts the ride
    @PostMapping("/{rideId}/start")
    public Ride startRide(@PathVariable Long rideId, Authentication auth) {
        return rideService.startRide(rideId, auth.getName());
    }

    // Driver ends the full ride
    @PostMapping("/{rideId}/end")
    public Ride endRide(@PathVariable Long rideId, Authentication auth) {
        return rideService.endRide(rideId, auth.getName());
    }
}