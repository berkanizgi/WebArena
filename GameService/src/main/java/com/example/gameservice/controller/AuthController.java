package com.example.gameservice.controller;

import com.example.gameservice.Repository.GameCharacterRepository;
import com.example.gameservice.domain.GameCharacter;
import com.example.gameservice.domain.Player;
import com.example.gameservice.request.LoginRequest;
import com.example.gameservice.request.RegisterRequest;
import com.example.gameservice.response.LoginResponse;
import com.example.gameservice.service.PlayerService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class AuthController {

    private final PlayerService playerService;
    private final GameCharacterRepository gameCharacterRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthController(PlayerService playerService, GameCharacterRepository gameCharacterRepository, BCryptPasswordEncoder passwordEncoder) {
        this.playerService = playerService;
        this.gameCharacterRepository = gameCharacterRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest loginRequest) {
        Player player = playerService.getByUsername(loginRequest.getUsername()).orElse(null);

        if (player == null) {
            return new LoginResponse(false, null, "User not found!");
        }

        if (!passwordEncoder.matches(loginRequest.getPassword(), player.getPasswordHash())) {
            return new LoginResponse(false, null, "Wrong Password");
        }

        return new LoginResponse(true, player.getPlayerId(), "Login Successful");
    }

    @PostMapping("/register")
    public LoginResponse register(@RequestBody RegisterRequest request) {
        if (playerService.getByUsername(request.getUsername()).isPresent()) {
            return new LoginResponse(false, null, "Username already exists");
        }

        // Passwort encoden
        String encodedPassword = passwordEncoder.encode(request.getPassword());

        // Default Character laden — du kannst "c1" durch deine ID ersetzen
        GameCharacter defaultCharacter = gameCharacterRepository.findById("c1").orElse(null);

        if (defaultCharacter == null) {
            return new LoginResponse(false, null, "No default Character found!");
        }

        Player newPlayer = playerService.registerNewPlayer(request.getUsername(), encodedPassword, defaultCharacter);

        return new LoginResponse(true, newPlayer.getPlayerId(), "Register Successful");
    }
}
