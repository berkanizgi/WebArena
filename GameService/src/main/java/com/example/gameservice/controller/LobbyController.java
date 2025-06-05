package com.example.gameservice.controller;



import com.example.gameservice.domain.Lobby;
import com.example.gameservice.domain.Player;
import com.example.gameservice.service.LobbyService;
import org.springframework.beans.factory.annotation.Autowired;
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

    @Autowired
    public LobbyService lobbyService;

    public LobbyController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/joinLobby")
    public void joinLobby(@Payload Map<String, String> data) {
        String playerId = data.get("playerId");
        Lobby lobby = lobbyService.joinLobby(playerId).orElseThrow();

        System.out.println("✅ [JOIN_LOBBY] Player " + playerId + " ist jetzt in Lobby " + lobby.getId());

        messagingTemplate.convertAndSend("/topic/lobby", Map.of("type", "LOBBY_UPDATED", "lobby", lobby));
    }


    @MessageMapping("/setReady")
    public void setReady(@Payload Map<String, String> data) {
        String playerId = data.get("playerId");

        Lobby updatedLobby = lobbyService.toggleReady(playerId);
        if (updatedLobby != null) {
            messagingTemplate.convertAndSend("/topic/lobby", Map.of("type", "LOBBY_UPDATED", "lobby", updatedLobby));
        }
    }

}

