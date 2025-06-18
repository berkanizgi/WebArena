package com.example.gameservice.service;

import com.example.gameservice.client.CharacterApiClient;
import com.example.gameservice.domain.GameMode;
import com.example.gameservice.domain.Player;
import com.example.gameservice.dto.PlayerOwnedCharacterDTO;
import com.example.gameservice.session.GameSession;
import com.example.gameservice.session.SessionPlayer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class GameSessionService {

    private final Map<String, GameSession> sessions = new ConcurrentHashMap<>();

    @Autowired
    private CharacterApiClient characterApiClient;


    public synchronized GameSession joinOrCreateSession(Player player, GameMode mode) {
        String selectedCharacterId = player.getWallet().getSelectedCharacterId();
        PlayerOwnedCharacterDTO owned = characterApiClient.getOwnedCharacter(player.getPlayerId(), selectedCharacterId);

        SessionPlayer sessionPlayer = new SessionPlayer(
                player.getPlayerId(),
                owned.getCharacterId(),
                "Name", // optional nachladen
                owned.getBaseHealth(),
                owned.getBaseAttack(),
                (int) owned.getBaseSpeed()
        );
        sessionPlayer.setGameMode(mode);




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
        newSession.setGameMode(mode);
        sessions.put(newSession.getId(), newSession);
        return newSession;
    }

    public GameSession getSession(String sessionId) {
        return sessions.get(sessionId);
    }

    public void maybeStartCountdown(GameSession session, SimpMessagingTemplate messagingTemplate) {
        synchronized (session) {
            if (session.isStarted()) return;

            // Für Multiplayer: nur wenn 2+ Spieler da
            if (session.getGameMode() == GameMode.MULTIPLAYER) {
                if (session.getSessionPlayers().size() < 2) return;
            }

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

                        if (Thread.currentThread().isInterrupted()) return;

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
                    // Abgebrochen, falls neuer Spieler kommt
                }
            });

            session.setCountdownThread(countdownThread);
            countdownThread.start();
        }
    }



}
