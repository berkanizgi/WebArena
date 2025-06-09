package com.example.gameservice.session;
import com.example.gameservice.domain.Player;

import java.util.ArrayList;
import java.util.List;

public class GameSession {
    private final String id;
    private final List<Player> players = new ArrayList<>();
    private boolean started = false;

    public GameSession(String id) {
        this.id = id;
    }

    public void addPlayer(Player player) {
        players.add(player);
    }

    public String getId() {
        return id;
    }

    public List<Player> getPlayers() {
        return players;
    }

    public boolean isStarted() {
        return started;
    }

    public void setStarted(boolean started) {
        this.started = started;
    }
}
