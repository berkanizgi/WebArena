package com.example.gameservice.service;

import com.example.gameservice.domain.GameCharacter;
import com.example.gameservice.domain.Player;
import com.example.gameservice.session.GameSession;
import com.example.gameservice.session.SessionPlayer;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class GameSessionService {

    private final Map<String, GameSession> sessions = new ConcurrentHashMap<>();

    public synchronized GameSession joinOrCreateSession(Player player) {
        GameCharacter character = player.getWallet().getSelectedCharacter();
        if (character == null) throw new IllegalStateException("Kein Charakter ausgewählt!");

        SessionPlayer sessionPlayer = new SessionPlayer(
                player.getPlayerId(),
                character.getCharacterId(),
                character.getName(),
                character.getBaseHealth(),
                character.getBaseAttack(),
                character.getSpeed()
        );


        // Suche offene Session mit < 4 Spielern
        for (GameSession session : sessions.values()) {
            if (!session.isStarted() && session.getSessionPlayers().size() < 4) {
                session.addSessionPlayer(sessionPlayer);
                return session;
            }
        }

        // Neue Session
        GameSession newSession = new GameSession(UUID.randomUUID().toString());
        newSession.addSessionPlayer(sessionPlayer);
        sessions.put(newSession.getId(), newSession);
        return newSession;
    }

    public GameSession getSession(String sessionId) {
        return sessions.get(sessionId);
    }

    public void maybeStartCountdown(GameSession session, SimpMessagingTemplate messagingTemplate) {
        if (session.getSessionPlayers().size() == 2 && !session.isStarted()) {
            session.setStarted(true); // ← Timer nur einmal starten
            new Thread(() -> {
                try {
                    for (int i = 10; i >= 0; i--) {
                        messagingTemplate.convertAndSend("/topic/session/" + session.getId(), Map.of(
                                "type", "COUNTDOWN",
                                "value", i
                        ));
                        Thread.sleep(1000);
                    }

                    // Nach Countdown → Spielstart pushen
                    for (SessionPlayer player : session.getSessionPlayers()) {
                        messagingTemplate.convertAndSend("/topic/session/" + session.getId(), Map.of(
                                "type", "START_GAME",
                                "playerId", player.getPlayerId(),
                                "sessionId", session.getId()
                        ));
                    }
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }).start();
        }
    }
}
