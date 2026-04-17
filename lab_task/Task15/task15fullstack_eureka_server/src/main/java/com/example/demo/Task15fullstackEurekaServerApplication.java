package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

@SpringBootApplication
@EnableEurekaServer
public class Task15fullstackEurekaServerApplication {

	public static void main(String[] args) {
		SpringApplication.run(Task15fullstackEurekaServerApplication.class, args);
	}

}
