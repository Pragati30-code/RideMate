package com.backend.prod.service;

import com.backend.prod.config.JwtUtil;
import com.backend.prod.dto.LoginResponse;
import com.backend.prod.entity.User;
import com.backend.prod.entity.UserRole;
import com.backend.prod.exception.EmailAlreadyExistsException;
import com.backend.prod.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
                   PasswordEncoder passwordEncoder,
                   JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public User register(User user) {
        if (user.getPassword() == null || user.getPassword().isBlank()) {
            throw new RuntimeException("Password cannot be null or empty");
        }

        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException("Email already registered");
        }

        user.setRole(UserRole.USER);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public LoginResponse login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        UserRole role = user.getRole() != null ? user.getRole() : UserRole.USER;
        if (user.getRole() == null) {
            user.setRole(UserRole.USER);
            userRepository.save(user);
        }

        String token = jwtUtil.generateToken(email, role.name());
        return new LoginResponse(token, user.getId(), user.getName(), user.getEmail(), role.name());
    }

    public User getCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}