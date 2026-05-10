package com.backend.prod.service;

import java.util.List;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.backend.prod.dto.EtaUpdate;
import com.backend.prod.entity.Booking;
import com.backend.prod.repository.BookingRepository;

@Service
public class EtaService {

    private static final double MIN_SPEED_KMH = 10.0;

    private final BookingRepository bookingRepository;
    private final RideService rideService;
    private final SimpMessagingTemplate messagingTemplate;

    public EtaService(BookingRepository bookingRepository,
                      RideService rideService,
                      SimpMessagingTemplate messagingTemplate) {
        this.bookingRepository = bookingRepository;
        this.rideService = rideService;
        this.messagingTemplate = messagingTemplate;
    }

    public void publishEtas(Long rideId, double driverLat, double driverLng, Double speedKmh) {
        List<Booking> bookings = bookingRepository.findByRideIdAndStatusNot(rideId, "CANCELLED");
        if (bookings.isEmpty()) return;

        double effectiveSpeed = (speedKmh == null || speedKmh < MIN_SPEED_KMH)
                ? MIN_SPEED_KMH
                : speedKmh;

        for (Booking booking : bookings) {
            Double pLat = booking.getPickupLatitude();
            Double pLng = booking.getPickupLongitude();
            if (pLat == null || pLng == null) continue;

            double distanceKm = rideService.calculateDistanceKm(driverLat, driverLng, pLat, pLng);
            long distanceM = Math.round(distanceKm * 1000.0);
            long etaSeconds = Math.round((distanceKm / effectiveSpeed) * 3600.0);

            messagingTemplate.convertAndSend(
                    "/topic/bookings/" + booking.getId() + "/eta",
                    new EtaUpdate(etaSeconds, distanceM)
            );
        }
    }
}
