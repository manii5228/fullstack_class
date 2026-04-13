package com.example.demo.api.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {
	@GetMapping("/{id}")
	public String getUser(@PathVariable String id) {
		return "Users Details for Id "+id +"(from identity service)";
	}
}
