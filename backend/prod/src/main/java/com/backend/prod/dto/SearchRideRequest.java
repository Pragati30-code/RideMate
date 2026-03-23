package com.backend.prod.dto;

public class SearchRideRequest {

    private String source;
    private String destination;

    private Double sourceLatitude;
    private Double sourceLongitude;
    private Double destinationLatitude;
    private Double destinationLongitude;

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }

    public Double getSourceLatitude() { return sourceLatitude; }
    public void setSourceLatitude(Double sourceLatitude) { this.sourceLatitude = sourceLatitude; }

    public Double getSourceLongitude() { return sourceLongitude; }
    public void setSourceLongitude(Double sourceLongitude) { this.sourceLongitude = sourceLongitude; }

    public Double getDestinationLatitude() { return destinationLatitude; }
    public void setDestinationLatitude(Double destinationLatitude) { this.destinationLatitude = destinationLatitude; }

    public Double getDestinationLongitude() { return destinationLongitude; }
    public void setDestinationLongitude(Double destinationLongitude) { this.destinationLongitude = destinationLongitude; }
}