package com.backend.prod.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.backend.prod.dto.DriverVerificationRequest;
import com.backend.prod.entity.User;
import com.backend.prod.repository.UserRepository;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
@CrossOrigin
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Submit vehicle details for verification
    @PostMapping("/submit-driver-details")
    public Map<String, String> submitDriverDetails(@RequestBody DriverVerificationRequest request, 
                                                    Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setVehicleNumber(request.getVehicleNumber());
        user.setDrivingLicense(request.getDrivingLicense());
        userRepository.save(user);

        return Map.of("message", "Driver details submitted for verification. You will be notified once verified.");
    }

    // Check driver verification status
    @GetMapping("/driver-status")
    public Map<String, Object> getDriverStatus(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return Map.of(
                "isVerifiedDriver", user.isVerifiedDriver(),
                "vehicleNumber", user.getVehicleNumber() != null ? user.getVehicleNumber() : "",
                "drivingLicense", user.getDrivingLicense() != null ? user.getDrivingLicense() : "",
                "detailsSubmitted", user.getVehicleNumber() != null && user.getDrivingLicense() != null
        );
    }

    // Admin endpoint to verify a driver (temporary - for manual verification)
    @PutMapping("/verify-driver/{userId}")
    public Map<String, String> verifyDriver(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getVehicleNumber() == null || user.getDrivingLicense() == null) {
            throw new RuntimeException("User has not submitted driver details");
        }

        user.setVerifiedDriver(true);
        userRepository.save(user);

        return Map.of("message", "User " + user.getName() + " is now a verified driver");
    }
}
