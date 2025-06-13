package com.example.gameservice.controller;

import com.example.gameservice.domain.Player;
import com.example.gameservice.dto.PlayerDTO;
import com.example.gameservice.service.PlayerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/players")
public class PlayerController {

    private final PlayerService playerService;

    @Autowired
    public PlayerController(PlayerService playerService) {
        this.playerService = playerService;
    }

    @GetMapping
    public List<Player> getAllPlayers() {
        return playerService.getAllPlayers();
    }

    @GetMapping("/next")
    public Player getNextPlayer() {
        return playerService.getNextPlayer();
    }


    @GetMapping("/{id}")
    public PlayerDTO getPlayerById(@PathVariable String id) {
        return playerService.getPlayerDtoById(id);
    }


    @PutMapping("/{playerId}/character")
    public ResponseEntity<Void> updateSelectedCharacter(
            @PathVariable String playerId,
            @RequestBody Map<String, String> body
    ) {
        String characterId = body.get("characterId");

        boolean success = playerService.updateSelectedCharacter(playerId, characterId);

        return success ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }


}
