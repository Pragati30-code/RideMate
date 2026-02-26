package com.backend.prod.controller;

import org.springframework.web.bind.annotation.*;

import com.backend.prod.entity.User;
import com.backend.prod.service.AuthService;

@RestController
@RequestMapping("/auth")
@CrossOrigin
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return authService.register(user);
    }

    @PostMapping("/login")
    public String login(@RequestParam String email,
                        @RequestParam String password) {

        return authService.login(email, password);
    }
}
