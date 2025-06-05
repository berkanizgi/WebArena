package com.example.gameservice.controller;

import com.example.gameservice.Repository.PlayerRepository;
import com.example.gameservice.domain.Player;
import com.example.gameservice.request.LoginRequest;
import com.example.gameservice.response.LoginResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class LoginController {

    @Autowired
    private PlayerRepository playerRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest loginRequest) {
        Player player = playerRepository.findByUsername(loginRequest.getUsername());

        if (player == null) {
            return new LoginResponse(false, null, "Benutzer nicht gefunden");
        }

        if (!passwordEncoder.matches(loginRequest.getPassword(), player.getPasswordHash())) {
            return new LoginResponse(false, null, "Falsches Passwort");
        }

        return new LoginResponse(true, player.getPlayerId(), "Login erfolgreich");
    }
}
