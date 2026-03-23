package com.backend.prod.entity;

import jakarta.persistence.*;

@Entity
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int seatsBooked;

    private String status; // CONFIRMED / CANCELLED

    // Many bookings belong to one ride
    @ManyToOne
    @JoinColumn(name = "ride_id")
    private Ride ride;

    // Many bookings belong to one user
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    // Passenger's pickup stop
    private String pickupName;
    private Double pickupLatitude;
    private Double pickupLongitude;

    // Passenger's drop stop
    private String dropName;
    private Double dropLatitude;
    private Double dropLongitude;

    // Fare = segmentDistanceKm × FARE_PER_KM × seatsBooked
    private Double segmentDistanceKm;
    private Double estimatedFare;

    // getters & setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public int getSeatsBooked() {
        return seatsBooked;
    }

    public void setSeatsBooked(int seatsBooked) {
        this.seatsBooked = seatsBooked;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Ride getRide() {
        return ride;
    }

    public void setRide(Ride ride) {
        this.ride = ride;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getPickupName() {
        return pickupName;
    }

    public void setPickupName(String pickupName) {
        this.pickupName = pickupName;
    }

    public Double getPickupLatitude() {
        return pickupLatitude;
    }

    public void setPickupLatitude(Double pickupLatitude) {
        this.pickupLatitude = pickupLatitude;
    }

    public Double getPickupLongitude() {
        return pickupLongitude;
    }

    public void setPickupLongitude(Double pickupLongitude) {
        this.pickupLongitude = pickupLongitude;
    }

    public String getDropName() {
        return dropName;
    }

    public void setDropName(String dropName) {
        this.dropName = dropName;
    }

    public Double getDropLatitude() {
        return dropLatitude;
    }

    public void setDropLatitude(Double dropLatitude) {
        this.dropLatitude = dropLatitude;
    }

    public Double getDropLongitude() {
        return dropLongitude;
    }

    public void setDropLongitude(Double dropLongitude) {
        this.dropLongitude = dropLongitude;
    }

    public Double getSegmentDistanceKm() {
        return segmentDistanceKm;
    }

    public void setSegmentDistanceKm(Double segmentDistanceKm) {
        this.segmentDistanceKm = segmentDistanceKm;
    }

    public Double getEstimatedFare() {
        return estimatedFare;
    }

    public void setEstimatedFare(Double estimatedFare) {
        this.estimatedFare = estimatedFare;
    }

}
