package com.backend.prod.dto;

import com.backend.prod.entity.Ride;

public class RideSearchResult {

    private Ride ride;

    // Fare for THIS passenger's specific segment (pickupCoords → dropCoords)
    private double estimatedFare;

    // Distance of passenger's segment in km
    private double segmentDistanceKm;

    public RideSearchResult(Ride ride, double estimatedFare, double segmentDistanceKm) {
        this.ride = ride;
        this.estimatedFare = estimatedFare;
        this.segmentDistanceKm = segmentDistanceKm;
    }

    public Ride getRide() { return ride; }
    public void setRide(Ride ride) { this.ride = ride; }

    public double getEstimatedFare() { return estimatedFare; }
    public void setEstimatedFare(double estimatedFare) { this.estimatedFare = estimatedFare; }

    public double getSegmentDistanceKm() { return segmentDistanceKm; }
    public void setSegmentDistanceKm(double segmentDistanceKm) { this.segmentDistanceKm = segmentDistanceKm; }
}
