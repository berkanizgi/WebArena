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
        synchronized (session) {
            if (session.isStarted()) return;

            // Wenn bereits ein Countdown läuft → abbrechen
            if (session.getCountdownThread() != null && session.getCountdownThread().isAlive()) {
                session.getCountdownThread().interrupt(); // Thread stoppen
            }

            Thread countdownThread = new Thread(() -> {
                try {
                    int countdown = 10;
                    while (countdown >= 0) {
                        messagingTemplate.convertAndSend("/topic/session/" + session.getId(), Map.of(
                                "type", "COUNTDOWN",
                                "value", countdown
                        ));
                        Thread.sleep(1000);

                        // Wenn jemand NEU gejoined ist → Countdown neu starten
                        if (Thread.currentThread().isInterrupted()) {
                            return;
                        }

                        countdown--;
                    }

                    // Nach Countdown → Spiel starten
                    session.setStarted(true);
                    for (SessionPlayer player : session.getSessionPlayers()) {
                        messagingTemplate.convertAndSend("/topic/session/" + session.getId(), Map.of(
                                "type", "START_GAME",
                                "playerId", player.getPlayerId(),
                                "sessionId", session.getId()
                        ));
                    }

                } catch (InterruptedException e) {
                    // Abgebrochen weil neuer Spieler dazukam
                }
            });

            session.setCountdownThread(countdownThread);
            countdownThread.start();
        }
    }

}
