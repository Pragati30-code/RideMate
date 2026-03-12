package com.backend.prod.controller;

import com.backend.prod.entity.DriverVerificationStatus;
import com.backend.prod.entity.User;
import com.backend.prod.repository.UserRepository;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin/driver-verifications")
@CrossOrigin
public class AdminVerificationController {

    private final UserRepository userRepository;

    public AdminVerificationController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/pending")
    public List<Map<String, Object>> getPendingRequests() {
        return userRepository.findByVerificationStatus(DriverVerificationStatus.PENDING)
                .stream()
                .map(user -> Map.<String, Object>of(
                        "userId", user.getId(),
                        "name", user.getName(),
                        "email", user.getEmail(),
                        "studentId", user.getStudentId() != null ? user.getStudentId() : "",
                        "vehicleNumber", user.getVehicleNumber() != null ? user.getVehicleNumber() : "",
                        "drivingLicense", user.getDrivingLicense() != null ? user.getDrivingLicense() : "",
                        "verificationStatus", user.getVerificationStatus() != null ? user.getVerificationStatus().name() : ""
                ))
                .collect(Collectors.toList());
    }

    @PutMapping("/{userId}/approve")
    public Map<String, String> approveRequest(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getVerificationStatus() != DriverVerificationStatus.PENDING) {
            throw new RuntimeException("Only pending requests can be approved");
        }

        user.setVerificationStatus(DriverVerificationStatus.VERIFIED);
        user.setVerifiedDriver(true);
        userRepository.save(user);

        return Map.of("message", "Driver request approved for user " + user.getName());
    }

    @PutMapping("/{userId}/reject")
    public Map<String, String> rejectRequest(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getVerificationStatus() != DriverVerificationStatus.PENDING) {
            throw new RuntimeException("Only pending requests can be rejected");
        }

        user.setVerificationStatus(DriverVerificationStatus.REJECTED);
        user.setVerifiedDriver(false);
        userRepository.save(user);

        return Map.of("message", "Driver request rejected for user " + user.getName());
    }
}
