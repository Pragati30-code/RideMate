package com.backend.prod.service;

import com.backend.prod.dto.CreateRideRequest;
import com.backend.prod.dto.RideSearchResult;
import com.backend.prod.entity.Ride;
import com.backend.prod.entity.User;
import com.backend.prod.repository.RideRepository;
import com.backend.prod.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class RideService {

    // Radius within which a passenger's pickup must be near ride's source,
    // and passenger's drop must be near ride's destination.
    private static final double PROXIMITY_RADIUS_KM = 5.0;

    // Fixed fare rate — change this one constant to update pricing app-wide
    public static final double FARE_PER_KM = 8.0;

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
            throw new RuntimeException(
                    "You need to be a verified driver to create rides. Please submit your vehicle details for verification.");
        }

        validateCoordinates(request);

        Ride ride = new Ride();
        ride.setSource(request.getSource());
        ride.setDestination(request.getDestination());
        ride.setSourceLatitude(request.getSourceLatitude());
        ride.setSourceLongitude(request.getSourceLongitude());
        ride.setDestinationLatitude(request.getDestinationLatitude());
        ride.setDestinationLongitude(request.getDestinationLongitude());
        ride.setDepartureTime(request.getDepartureTime());
        ride.setAvailableSeats(request.getAvailableSeats());
        ride.setDriver(driver);
        ride.setStatus("ACTIVE");

        // Compute and store full route distance at creation time
        double distanceKm = calculateDistanceKm(
                request.getSourceLatitude(), request.getSourceLongitude(),
                request.getDestinationLatitude(), request.getDestinationLongitude());
        ride.setDistanceKm(distanceKm);

        return rideRepository.save(ride);
    }

    /**
     * Search rides by proximity.
     *
     * A ride is returned if:
     * - Passenger's pickup is within PROXIMITY_RADIUS_KM of ride's source
     * - Passenger's drop is within PROXIMITY_RADIUS_KM of ride's destination
     * - Ride departs in the future
     * - Ride is ACTIVE or FULL (show full rides — may free up if someone cancels)
     *
     * Each result includes the estimated fare for the passenger's specific segment.
     */
    public List<RideSearchResult> searchRidesWithFare(
            double passengerPickupLat, double passengerPickupLng,
            double passengerDropLat, double passengerDropLng) {

        List<Ride> candidates = rideRepository
                .findByStatusInAndDepartureTimeAfter(
                        List.of("ACTIVE", "FULL"),
                        LocalDateTime.now());

        return candidates.stream()
                .filter(ride -> {
                    double pickupDistance = calculateDistanceKm(
                            passengerPickupLat, passengerPickupLng,
                            ride.getSourceLatitude(), ride.getSourceLongitude());
                    double dropDistance = calculateDistanceKm(
                            passengerDropLat, passengerDropLng,
                            ride.getDestinationLatitude(), ride.getDestinationLongitude());
                    return pickupDistance <= PROXIMITY_RADIUS_KM
                            && dropDistance <= PROXIMITY_RADIUS_KM;
                })
                .map(ride -> {
                    double segmentKm = calculateDistanceKm(
                            passengerPickupLat, passengerPickupLng,
                            passengerDropLat, passengerDropLng);
                    double fare = Math.round(segmentKm * FARE_PER_KM * 100.0) / 100.0;
                    double roundedKm = Math.round(segmentKm * 100.0) / 100.0;
                    return new RideSearchResult(ride, fare, roundedKm);
                })
                .collect(Collectors.toList());
    }

    // Driver starts the ride
    public Ride startRide(Long rideId, String driverEmail) {
        Ride ride = getRideAndVerifyDriver(rideId, driverEmail);

        String status = ride.getStatus();
        if (!"ACTIVE".equals(status) && !"FULL".equals(status)) {
            throw new RuntimeException("Only ACTIVE or FULL rides can be started. Current status: " + status);
        }

        ride.setStatus("IN_PROGRESS");
        ride.setStartedAt(LocalDateTime.now());
        return rideRepository.save(ride);
    }

    // Driver ends the full ride after all passengers dropped
    public Ride endRide(Long rideId, String driverEmail) {
        Ride ride = getRideAndVerifyDriver(rideId, driverEmail);

        if (!"IN_PROGRESS".equals(ride.getStatus())) {
            throw new RuntimeException("Only IN_PROGRESS rides can be ended. Current status: " + ride.getStatus());
        }

        ride.setStatus("COMPLETED");
        ride.setEndedAt(LocalDateTime.now());
        return rideRepository.save(ride);
    }

    public List<Ride> getMyRides(String email) {
        User driver = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return rideRepository.findByDriver(driver);
    }

    public Ride cancelRide(Long rideId, String email) {
        Ride ride = getRideAndVerifyDriver(rideId, email);

        if ("IN_PROGRESS".equals(ride.getStatus()) || "COMPLETED".equals(ride.getStatus())) {
            throw new RuntimeException("Cannot cancel a ride that has already started or completed");
        }

        ride.setStatus("CANCELLED");
        return rideRepository.save(ride);
    }

    public List<Ride> getAllActiveRides() {
        return rideRepository.findByStatusAndDepartureTimeAfterAndAvailableSeatsGreaterThan(
                "ACTIVE",
                LocalDateTime.now(),
                0);
    }
    // --- Helpers ---

    private Ride getRideAndVerifyDriver(Long rideId, String driverEmail) {
        User driver = userRepository.findByEmail(driverEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Ride ride = rideRepository.findById(Objects.requireNonNull(rideId, "rideId is required"))
                .orElseThrow(() -> new RuntimeException("Ride not found"));
        if (!ride.getDriver().getId().equals(driver.getId())) {
            throw new RuntimeException("You can only manage your own rides");
        }
        return ride;
    }

    /**
     * Haversine formula — returns straight-line distance in km.
     * No external API needed. Accurate enough for urban proximity checks.
     */
    public double calculateDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        final int EARTH_RADIUS_KM = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                        * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }

    private void validateCoordinates(CreateRideRequest request) {
        validateLatitude(request.getSourceLatitude(), "sourceLatitude");
        validateLongitude(request.getSourceLongitude(), "sourceLongitude");
        validateLatitude(request.getDestinationLatitude(), "destinationLatitude");
        validateLongitude(request.getDestinationLongitude(), "destinationLongitude");
    }

    private void validateLatitude(Double value, String fieldName) {
        if (value == null)
            return;
        if (value < -90 || value > 90)
            throw new RuntimeException(fieldName + " must be between -90 and 90");
    }

    private void validateLongitude(Double value, String fieldName) {
        if (value == null)
            return;
        if (value < -180 || value > 180)
            throw new RuntimeException(fieldName + " must be between -180 and 180");
    }
}
