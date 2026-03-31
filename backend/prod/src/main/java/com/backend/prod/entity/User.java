package com.backend.prod.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(nullable = false)
    private String password;

    private String studentId;

    private String gender;

    private String phoneNumber;

    @Column(name = "ride_otp", length = 6)
    private String rideOtp;

    // Driver verification fields
    private String vehicleNumber;

    private String vehicleModel;

    private String drivingLicense;

    @Column(name = "verified_driver", nullable = false)
    private Boolean verifiedDriver = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "user_role")
    private UserRole role = UserRole.USER;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status")
    private DriverVerificationStatus verificationStatus;

    // ===== Getters and Setters =====

    public Long getId() { 
        return id; 
    }

    public void setId(Long id) { 
        this.id = id; 
    }

    public String getName() { 
        return name; 
    }

    public void setName(String name) { 
        this.name = name; 
    }

    public String getEmail() { 
        return email; 
    }

    public void setEmail(String email) { 
        this.email = email; 
    }

    public String getPassword() { 
        return password; 
    }

    public void setPassword(String password) { 
        this.password = password; 
    }

    public String getStudentId() { 
        return studentId; 
    }

    public void setStudentId(String studentId) { 
        this.studentId = studentId; 
    }

    public String getGender() { 
        return gender; 
    }

    public void setGender(String gender) { 
        this.gender = gender; 
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getRideOtp() {
        return rideOtp;
    }

    public void setRideOtp(String rideOtp) {
        this.rideOtp = rideOtp;
    }

    public String getVehicleNumber() {
        return vehicleNumber;
    }

    public void setVehicleNumber(String vehicleNumber) {
        this.vehicleNumber = vehicleNumber;
    }

    public String getVehicleModel() {
        return vehicleModel;
    }

    public void setVehicleModel(String vehicleModel) {
        this.vehicleModel = vehicleModel;
    }

    public String getDrivingLicense() {
        return drivingLicense;
    }

    public void setDrivingLicense(String drivingLicense) {
        this.drivingLicense = drivingLicense;
    }

    public boolean isVerifiedDriver() {
        return verifiedDriver;
    }

    public void setVerifiedDriver(boolean verifiedDriver) {
        this.verifiedDriver = verifiedDriver;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public DriverVerificationStatus getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(DriverVerificationStatus verificationStatus) {
        this.verificationStatus = verificationStatus;
    }
}