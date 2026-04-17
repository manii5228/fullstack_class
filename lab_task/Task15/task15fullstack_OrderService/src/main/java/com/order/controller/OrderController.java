package com.order.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
public class OrderController {

    private final RestTemplate restTemplate;

    public OrderController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @GetMapping("/orders")
    public String getOrders() {
        // Notice: No localhost, using SERVICE NAME
        String response = restTemplate.getForObject(
            "http://USER-SERVICE/users", String.class
        );

        return "Order Service calling -> " + response;
    }
}