package com.example.gameservice.controller;



import com.example.gameservice.domain.Lobby;
import com.example.gameservice.domain.Player;
import com.example.gameservice.service.LobbyService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Controller
@CrossOrigin
public class LobbyController {

    private final SimpMessagingTemplate messagingTemplate;
    private final Map<String, Lobby> lobbies = new HashMap<>();

    public LobbyController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/createLobby")
    public void createLobby(@Payload Map<String, String> data) {
        String playerId = data.get("playerId");
        Player owner = new Player(playerId);
        String lobbyId = UUID.randomUUID().toString();
        Lobby lobby = new Lobby(lobbyId, owner);
        lobby.addPlayer(owner); // ← damit der Ersteller auch in der Liste ist
        lobbies.put(lobbyId, lobby);

        messagingTemplate.convertAndSend("/topic/lobby", Map.of("type", "LOBBY_CREATED", "lobby", lobby));
    }

    @MessageMapping("/setReady")
    public void setReady(@Payload Map<String, String> data) {
        String lobbyId = data.get("lobbyId");
        String playerId = data.get("playerId");
        Lobby lobby = lobbies.get(lobbyId);

        if (lobby != null) {
            lobby.getPlayers().stream()
                    .filter(p -> p.getPlayerId().equals(playerId))
                    .findFirst()
                    .ifPresent(p -> p.setReady(true));

            lobby.updateStatus();

            messagingTemplate.convertAndSend("/topic/lobby", Map.of("type", "LOBBY_UPDATED", "lobby", lobby));
        }
    }
}

