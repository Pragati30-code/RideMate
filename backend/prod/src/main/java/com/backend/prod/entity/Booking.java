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

    // getters & setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public int getSeatsBooked() { return seatsBooked; }
    public void setSeatsBooked(int seatsBooked) { this.seatsBooked = seatsBooked; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Ride getRide() { return ride; }
    public void setRide(Ride ride) { this.ride = ride; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}
