package com.example.demo.controller;



import com.example.demo.model.User;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
public class UserController {

    @PostMapping("/register")
    public String register(@Valid @RequestBody User user) {
        return "User registered successfully!";
    }
}