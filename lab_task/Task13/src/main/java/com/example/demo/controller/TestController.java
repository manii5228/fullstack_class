package com.example.demo.controller;



import com.example.demo.exception.ResourceNotFoundException;
import org.springframework.web.bind.annotation.*;

@RestController
public class TestController {

    @GetMapping("/users/{id}")
    public String getUser(@PathVariable int id) {

        if (id != 1) {
            throw new ResourceNotFoundException("User not found: " + id);
        }

        return "User Found";
    }
}