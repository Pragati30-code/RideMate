package com.backend.prod.controller;

import org.springframework.web.bind.annotation.*;
import java.util.List;

import com.backend.prod.entity.Ride;
import com.backend.prod.repository.RideRepository;

@RestController
@RequestMapping("/rides")
@CrossOrigin
public class RideController {

    private final RideRepository rideRepository;

    public RideController(RideRepository rideRepository) {
        this.rideRepository = rideRepository;
    }

    @PostMapping
    public Ride createRide(@RequestBody Ride ride) {
        return rideRepository.save(ride);
    }

    @GetMapping
    public List<Ride> getAllRides() {
        return rideRepository.findAll();
    }
}