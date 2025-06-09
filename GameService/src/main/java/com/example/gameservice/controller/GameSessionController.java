package com.example.gameservice.controller;

import com.example.gameservice.Repository.PlayerRepository;
import com.example.gameservice.domain.Player;
import com.example.gameservice.service.GameSessionService;
import com.example.gameservice.session.GameSession;
import com.example.gameservice.session.SessionPlayer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

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

        return session.getSessionPlayers().stream()
                .map(p -> Map.of(
                        "name", p.getCharacterName(),
                        "characterId", p.getCharacterId()
                ))
                .toList();
    }

    @GetMapping("/{sessionId}/me")
    public SessionPlayer getMySessionData(@PathVariable String sessionId, @RequestParam String playerId) {
        GameSession session = sessionService.getSession(sessionId);
        if (session == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Session nicht gefunden");

        SessionPlayer player = session.getByPlayerId(playerId);
        if (player == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Spieler nicht in Session");

        return player;
    }

    @PostMapping("/start")
    public Map<String, String> startGameSession(@RequestParam String playerId) {
        Player player = playerRepository.findById(playerId).orElseThrow();

        GameSession session = sessionService.joinOrCreateSession(player);
        sessionService.maybeStartCountdown(session, messagingTemplate);

        messagingTemplate.convertAndSend("/topic/session/" + session.getId(), Map.of(
                "type", "PLAYER_JOINED",
                "player", Map.of(
                        "name", player.getName(),
                        "characterId", player.getWallet().getSelectedCharacterId()
                ),
                "playerCount", session.getSessionPlayers().size()
        ));

        return Map.of("sessionId", session.getId());
    }
}
