package com.example.gameservice.session;
import com.example.gameservice.domain.GameMode;
import com.example.gameservice.domain.Player;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class GameSession {
    private final String id;
    private final List<SessionPlayer> sessionPlayers = new ArrayList<>();
    private boolean started = false;
    private transient Thread countdownThread;

    private GameMode gameMode;

    private final Map<String, Integer> currentHealthMap = new ConcurrentHashMap<>();





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


    public Thread getCountdownThread() {
        return countdownThread;
    }

    public void setCountdownThread(Thread thread) {
        this.countdownThread = thread;
    }

    public GameMode getGameMode() {
        return gameMode;
    }

    public void setGameMode(GameMode gameMode) {
        this.gameMode = gameMode;
    }

    public int getCurrentHealth(String playerId) {
        return currentHealthMap.getOrDefault(playerId, getByPlayerId(playerId).getBaseHealth());
    }

    public void setCurrentHealth(String playerId, int value) {
        currentHealthMap.put(playerId, value);
    }
}
