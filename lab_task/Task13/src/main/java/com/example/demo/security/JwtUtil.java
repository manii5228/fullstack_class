package com.example.demo.security;



import io.jsonwebtoken.*;
import java.util.Date;

public class JwtUtil {

    private static final String SECRET = "secret123";

    public static String generateToken(String username) {

        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(SignatureAlgorithm.HS256, SECRET)
                .compact();
    }
}