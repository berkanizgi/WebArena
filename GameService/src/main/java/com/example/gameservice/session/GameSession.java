package com.example.gameservice.session;

import java.util.ArrayList;
import java.util.List;

public class GameSession {

    private String sessionId;
    private List<SessionPlayer> players = new ArrayList<>();

    public GameSession(String sessionId) {
        this.sessionId = sessionId;
    }

    public void addPlayer(SessionPlayer player) {
        this.players.add(player);
    }

    public String getSessionId() {
        return sessionId;
    }

    public List<SessionPlayer> getPlayers() {
        return players;
    }
}
