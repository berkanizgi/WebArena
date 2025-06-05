package com.example.gameservice.controller;


import com.example.gameservice.domain.Lobby;
import com.example.gameservice.service.LobbyService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import java.util.HashMap;
import java.util.Map;


@Component
public class LobbyWebSocketHandler extends TextWebSocketHandler {

    @Autowired
    private LobbyService lobbyService;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Map<String, String> sessionToPlayer = new HashMap<>();
    private final Map<String, WebSocketSession> playerSessions = new HashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        // Verbindung angenommen
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        Map<String, String> payload = objectMapper.readValue(message.getPayload(), Map.class);

        String type = payload.get("type");
        String playerId = payload.get("playerId");

        if ("JOIN_LOBBY".equals(type) && playerId != null) {
            sessionToPlayer.put(session.getId(), playerId);
            playerSessions.put(playerId, session);

            var lobby = lobbyService.joinLobby(playerId).orElseThrow();
            broadcastLobbyUpdate(lobby);

        } else if ("TOGGLE_READY".equals(type) && playerId != null) {
            var lobby = lobbyService.toggleReady(playerId);
            broadcastLobbyUpdate(lobby);
        }
    }

    private void broadcastLobbyUpdate(Lobby lobby) throws Exception {
        Map<String, Object> response = new HashMap<>();
        response.put("type", "LOBBY_UPDATED");
        response.put("lobbyId", lobby.getId());
        response.put("status", lobby.getStatus().toString());
        response.put("players", lobby.getPlayerStates().keySet());
        response.put("lobby", lobby); // <--- hinzufügen


        String jsonResponse = objectMapper.writeValueAsString(response);

        for (String playerId : lobby.getPlayerStates().keySet()) {
            WebSocketSession s = playerSessions.get(playerId);
            if (s != null && s.isOpen()) {
                s.sendMessage(new TextMessage(jsonResponse));
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String playerId = sessionToPlayer.remove(session.getId());
        if (playerId != null) {
            playerSessions.remove(playerId);
            lobbyService.removePlayer(playerId);
        }
    }
}
