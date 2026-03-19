package com.backend.prod.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.prod.entity.DriverVerificationStatus;
import com.backend.prod.entity.User;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByVerificationStatus(DriverVerificationStatus verificationStatus);
}