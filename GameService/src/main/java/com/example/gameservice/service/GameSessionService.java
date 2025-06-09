package com.example.gameservice.service;

import com.example.gameservice.domain.Player;
import com.example.gameservice.session.GameSession;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class GameSessionService {

    private final Map<String, GameSession> sessions = new ConcurrentHashMap<>();

    public synchronized GameSession joinOrCreateSession(Player player) {
        // Suche offene Session mit < 4 Spielern
        for (GameSession session : sessions.values()) {
            if (!session.isStarted() && session.getPlayers().size() < 4) {
                session.addPlayer(player);
                return session;
            }
        }

        // Neue Session
        GameSession newSession = new GameSession(UUID.randomUUID().toString());
        newSession.addPlayer(player);
        sessions.put(newSession.getId(), newSession);
        return newSession;
    }

    public GameSession getSession(String sessionId) {
        return sessions.get(sessionId);
    }
}
