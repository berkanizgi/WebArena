package com.example.gameservice.controller;

import com.example.gameservice.Repository.PlayerRepository;
import com.example.gameservice.domain.Player;
import com.example.gameservice.service.GameSessionService;
import com.example.gameservice.session.GameSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/game-session")
@CrossOrigin
public class GameSessionController {

    @Autowired
    private GameSessionService sessionService;

    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @GetMapping("/{sessionId}/players")
    public List<Map<String, String>> getPlayers(@PathVariable String sessionId) {
        GameSession session = sessionService.getSession(sessionId);
        if (session == null) return List.of();

        return session.getPlayers().stream()
                .map(p -> Map.of(
                        "name", p.getName(),
                        "characterId", p.getWallet().getSelectedCharacterId()
                ))
                .toList();
    }



    @PostMapping("/start")
    public Map<String, String> startGameSession(@RequestParam String playerId) {
        Player player = playerRepository.findById(playerId).orElseThrow();

        GameSession session = sessionService.joinOrCreateSession(player);

        // STOMP: an alle in der Session pushen
        messagingTemplate.convertAndSend("/topic/session/" + session.getId(), Map.of(
                "type", "PLAYER_JOINED",
                "player", Map.of("name", player.getName(), "characterId", player.getWallet().getSelectedCharacterId()),
                "playerCount", session.getPlayers().size()
        ));

        return Map.of("sessionId", session.getId());
    }
}
