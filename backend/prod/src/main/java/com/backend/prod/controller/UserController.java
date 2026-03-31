package com.backend.prod.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.backend.prod.dto.DriverVerificationRequest;
import com.backend.prod.entity.DriverVerificationStatus;
import com.backend.prod.entity.User;
import com.backend.prod.entity.UserRole;
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
    public List<User> getAllUsers(Authentication auth) {
        User requester = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (requester.getRole() != UserRole.ADMIN) {
            throw new RuntimeException("Only admins can view all users");
        }

        return userRepository.findAll();
    }

    // Submit vehicle details for verification
    @PostMapping("/submit-driver-details")
    public Map<String, String> submitDriverDetails(@RequestBody DriverVerificationRequest request, 
                                                    Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setVehicleNumber(request.getVehicleNumber());
        user.setVehicleModel(request.getVehicleModel());
        user.setDrivingLicense(request.getDrivingLicense());
        user.setVerificationStatus(DriverVerificationStatus.PENDING);
        user.setVerifiedDriver(false);
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
                "verificationStatus", user.getVerificationStatus() != null ? user.getVerificationStatus().name() : "",
                "vehicleNumber", user.getVehicleNumber() != null ? user.getVehicleNumber() : "",
                "vehicleModel", user.getVehicleModel() != null ? user.getVehicleModel() : "",
                "drivingLicense", user.getDrivingLicense() != null ? user.getDrivingLicense() : "",
                "detailsSubmitted", user.getVehicleNumber() != null
                    && user.getVehicleModel() != null
                    && user.getDrivingLicense() != null
        );
    }
}
