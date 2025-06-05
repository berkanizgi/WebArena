package com.example.gameservice.service;

import com.example.gameservice.domain.Lobby;
import com.example.gameservice.domain.Player;
import com.example.gameservice.session.GameSession;
import com.example.gameservice.session.SessionPlayer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class GameSessionService {

    @Autowired
    private LobbyService lobbyService;


    private final Map<String, GameSession> sessions = new ConcurrentHashMap<>();

    public GameSession createSessionForPlayer(Player player) {
        String sessionId = UUID.randomUUID().toString();
        GameSession session = new GameSession(sessionId);

        // Hole die Lobby, zu der der Player gehört
        Lobby lobby = findLobbyForPlayer(player.getPlayerId());
        if (lobby == null) {
            throw new RuntimeException("Lobby nicht gefunden");
        }

        // Füge alle Spieler aus der Lobby in die Session ein
        for (Player p : lobby.getPlayers()) {
            SessionPlayer sessionPlayer = new SessionPlayer(
                    p.getPlayerId(),
                    p.getSelectedCharacter().getCharacterId(),
                    p.getSelectedCharacter().getName(),
                    p.getSelectedCharacter().getBaseHealth(),
                    p.getSelectedCharacter().getBaseAttack(),
                    p.getSelectedCharacter().getSpeed()
            );
            session.addPlayer(sessionPlayer);
        }

        sessions.put(sessionId, session);
        return session;
    }


    public GameSession getSession(String sessionId) {
        return sessions.get(sessionId);
    }

    public void removeSession(String sessionId) {
        sessions.remove(sessionId);
    }

    private Lobby findLobbyForPlayer(String playerId) {
        return lobbyService.getAllLobbies().stream()
                .filter(lobby -> lobby.getPlayers().stream().anyMatch(p -> p.getPlayerId().equals(playerId)))
                .findFirst()
                .orElse(null);
    }

}
