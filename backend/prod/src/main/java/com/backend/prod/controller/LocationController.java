package com.backend.prod.controller;

import java.security.Principal;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.backend.prod.dto.LocationPing;
import com.backend.prod.entity.Ride;
import com.backend.prod.repository.RideRepository;
import com.backend.prod.service.EtaService;

@Controller
public class LocationController {

    private final RideRepository rideRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final EtaService etaService;

    public LocationController(RideRepository rideRepository,
                              SimpMessagingTemplate messagingTemplate,
                              EtaService etaService) {
        this.rideRepository = rideRepository;
        this.messagingTemplate = messagingTemplate;
        this.etaService = etaService;
    }

    @MessageMapping("/rides/{rideId}/location")
    public void onDriverLocation(@DestinationVariable Long rideId,
                                 @Payload LocationPing ping,
                                 Principal principal) {
        if (principal == null || ping == null || ping.getLat() == null || ping.getLng() == null) {
            return;
        }

        Ride ride = rideRepository.findById(rideId).orElse(null);
        if (ride == null) return;
        if (!"IN_PROGRESS".equals(ride.getStatus())) return;
        if (ride.getDriver() == null) return;
        if (!principal.getName().equalsIgnoreCase(ride.getDriver().getEmail())) return;

        if (ping.getTs() == null) {
            ping.setTs(System.currentTimeMillis());
        }

        messagingTemplate.convertAndSend("/topic/rides/" + rideId + "/location", ping);
        etaService.publishEtas(rideId, ping.getLat(), ping.getLng(), ping.getSpeedKmh());
    }
}
