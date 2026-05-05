package com.backend.prod.controller;

import java.security.Principal;
import java.time.Instant;
import java.util.Map;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class PingController {

    @MessageMapping("/ping")
    @SendTo("/topic/ping")
    public Map<String, Object> ping(Principal principal) {
        return Map.of(
                "pong", true,
                "user", principal != null ? principal.getName() : "anonymous",
                "ts", Instant.now().toEpochMilli()
        );
    }
}
