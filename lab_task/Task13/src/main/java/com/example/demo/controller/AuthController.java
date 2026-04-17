package com.example.demo.controller;



import com.example.demo.security.JwtUtil;
import org.springframework.web.bind.annotation.*;

@RestController
public class AuthController {

    @PostMapping("/login")
    public String login(@RequestParam String username,
                        @RequestParam String password) {

        if (username.equals("admin") && password.equals("admin")) {
            return JwtUtil.generateToken(username);
        } else {
            throw new RuntimeException("Invalid credentials");
        }
    }
}