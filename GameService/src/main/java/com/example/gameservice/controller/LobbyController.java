package com.example.gameservice.controller;



import com.example.gameservice.domain.Lobby;
import com.example.gameservice.service.LobbyService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collection;

@RestController
@RequestMapping("/api/lobbies")
public class LobbyController {

    private final LobbyService lobbyService;

    public LobbyController(LobbyService lobbyService) {
        this.lobbyService = lobbyService;
    }

    @GetMapping
    public Collection<Lobby> getAllLobbies() {
        return lobbyService.getAllLobbies();
    }

    @GetMapping("/{id}")
    public Lobby getLobby(@PathVariable String id) {
        return lobbyService.getLobby(id);
    }
}

