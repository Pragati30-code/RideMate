package com.backend.prod.service;

import com.backend.prod.dto.CreateRideRequest;
import com.backend.prod.entity.Ride;
import com.backend.prod.entity.User;
import com.backend.prod.repository.RideRepository;
import com.backend.prod.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RideService {

    private final RideRepository rideRepository;
    private final UserRepository userRepository;

    public RideService(RideRepository rideRepository, UserRepository userRepository) {
        this.rideRepository = rideRepository;
        this.userRepository = userRepository;
    }

    public Ride createRide(String email, CreateRideRequest request) {
        User driver = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!driver.isVerifiedDriver()) {
            throw new RuntimeException("You need to be a verified driver to create rides. Please submit your vehicle details for verification.");
        }

        Ride ride = new Ride();
        ride.setSource(request.getSource());
        ride.setDestination(request.getDestination());
        ride.setDepartureTime(request.getDepartureTime());
        ride.setAvailableSeats(request.getAvailableSeats());
        ride.setPrice(request.getPrice());
        ride.setDriver(driver);
        ride.setStatus("ACTIVE");

        return rideRepository.save(ride);
    }

    public List<Ride> searchRides(String source, String destination) {
        return rideRepository.findBySourceAndDestinationAndStatusAndDepartureTimeAfterAndAvailableSeatsGreaterThan(
                source, 
                destination, 
                "ACTIVE", 
                LocalDateTime.now(),
                0
        );
    }

    public List<Ride> searchRidesFlexible(String source, String destination) {
        // Case-insensitive partial match for source and destination
        return rideRepository.findActiveRidesBySourceAndDestination(
                source.toLowerCase(), 
                destination.toLowerCase(), 
                LocalDateTime.now()
        );
    }

    public List<Ride> getMyRides(String email) {
        User driver = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return rideRepository.findByDriver(driver);
    }

    public Ride cancelRide(Long rideId, String email) {
        User driver = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        if (!ride.getDriver().getId().equals(driver.getId())) {
            throw new RuntimeException("You can only cancel your own rides");
        }

        ride.setStatus("CANCELLED");
        return rideRepository.save(ride);
    }

    public List<Ride> getAllActiveRides() {
        return rideRepository.findByStatusAndDepartureTimeAfterAndAvailableSeatsGreaterThan(
                "ACTIVE", 
                LocalDateTime.now(), 
                0
        );
    }
}
