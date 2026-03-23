package com.backend.prod.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Ride {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String source;
    private String destination;

    private Double sourceLatitude;
    private Double sourceLongitude;
    private Double destinationLatitude;
    private Double destinationLongitude;

    private LocalDateTime departureTime;

    private int availableSeats;

    private double price;

    private String status = "ACTIVE"; // ACTIVE, COMPLETED, CANCELLED

    // Many rides can be created by one user (driver)
    @ManyToOne
    @JoinColumn(name = "driver_id")
    private User driver;

    // getters & setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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

    public LocalDateTime getDepartureTime() { return departureTime; }
    public void setDepartureTime(LocalDateTime departureTime) { this.departureTime = departureTime; }

    public int getAvailableSeats() { return availableSeats; }
    public void setAvailableSeats(int availableSeats) { this.availableSeats = availableSeats; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public User getDriver() { return driver; }
    public void setDriver(User driver) { this.driver = driver; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
