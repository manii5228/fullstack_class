package com.example.demo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
@RestController
public class UserController {
	@Autowired
	private Environment environment;
	@GetMapping("/users")
	public String getUser() {
		String port=environment.getProperty("local.server.port");
		return "Response from USER -SERVICE running on port:"+port;
	}
}
