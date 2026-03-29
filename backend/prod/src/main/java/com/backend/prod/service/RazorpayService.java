package com.backend.prod.service;

import com.backend.prod.dto.RazorpayOrderResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Service
public class RazorpayService {

    private static final String RAZORPAY_ORDERS_URL = "https://api.razorpay.com/v1/orders";

    @Value("${razorpay.key-id:}")
    private String razorpayKeyId;

    @Value("${razorpay.key-secret:}")
    private String razorpayKeySecret;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public RazorpayOrderResponse createOrder(long amountInPaise, String bookingId) {
        if (razorpayKeyId == null || razorpayKeyId.isBlank() || razorpayKeySecret == null || razorpayKeySecret.isBlank()) {
            throw new RuntimeException("Razorpay credentials are not configured");
        }

        try {
            String payload = objectMapper.createObjectNode()
                    .put("amount", amountInPaise)
                    .put("currency", "INR")
                    .put("receipt", "booking-" + bookingId)
                    .put("payment_capture", 1)
                    .toString();

            String basicAuth = Base64.getEncoder()
                    .encodeToString((razorpayKeyId + ":" + razorpayKeySecret).getBytes(StandardCharsets.UTF_8));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(RAZORPAY_ORDERS_URL))
                    .header("Authorization", "Basic " + basicAuth)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(payload))
                    .build();

            HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new RuntimeException("Failed to create Razorpay order");
            }

            JsonNode body = objectMapper.readTree(response.body());

            RazorpayOrderResponse orderResponse = new RazorpayOrderResponse();
            orderResponse.setKeyId(razorpayKeyId);
            orderResponse.setOrderId(body.path("id").asText());
            orderResponse.setAmount(body.path("amount").asLong());
            orderResponse.setCurrency(body.path("currency").asText("INR"));
            orderResponse.setBookingId(bookingId);
            return orderResponse;
        } catch (Exception e) {
            throw new RuntimeException("Unable to create Razorpay order", e);
        }
    }

    public boolean verifySignature(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature) {
        if (razorpayKeySecret == null || razorpayKeySecret.isBlank()) {
            throw new RuntimeException("Razorpay secret is not configured");
        }

        try {
            String data = razorpayOrderId + "|" + razorpayPaymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(razorpayKeySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hashBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            String expected = bytesToHex(hashBytes);
            return expected.equalsIgnoreCase(razorpaySignature);
        } catch (Exception e) {
            throw new RuntimeException("Unable to verify Razorpay signature", e);
        }
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder hexString = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }
}
