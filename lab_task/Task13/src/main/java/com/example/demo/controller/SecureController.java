package com.example.demo.controller;



import org.springframework.web.bind.annotation.*;

@RestController
public class SecureController {

    @GetMapping("/secure")
    public String secure() {
        return "Accessed Secure API!";
    }
}