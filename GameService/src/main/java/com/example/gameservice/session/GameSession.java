package com.example.gameservice.session;
import com.example.gameservice.domain.Player;

import java.util.ArrayList;
import java.util.List;

public class GameSession {
    private final String id;
    private final List<SessionPlayer> sessionPlayers = new ArrayList<>();
    private boolean started = false;

    public GameSession(String id) {
        this.id = id;
    }

    public void addSessionPlayer(SessionPlayer sessionPlayer) {
        sessionPlayers.add(sessionPlayer);
    }

    public List<SessionPlayer> getSessionPlayers() {
        return sessionPlayers;
    }

    public SessionPlayer getByPlayerId(String playerId) {
        return sessionPlayers.stream()
                .filter(p -> p.getPlayerId().equals(playerId))
                .findFirst()
                .orElse(null);
    }

    public String getId() {
        return id;
    }

    public boolean isStarted() {
        return started;
    }

    public void setStarted(boolean started) {
        this.started = started;
    }
}
