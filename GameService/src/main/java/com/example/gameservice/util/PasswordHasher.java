package com.example.gameservice.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHasher {

    public static void printHash(String rawPassword) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String hash = encoder.encode(rawPassword);
        System.out.println("🔒 Hashed password: " + hash);
    }
}

