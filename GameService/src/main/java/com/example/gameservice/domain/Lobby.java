package com.example.gameservice.domain;

import jakarta.persistence.*;

import java.util.*;

public class Lobby {
    private final String id;
    private LobbyStatus status;
    private final Set<String> players = new HashSet<>();
    private static final int MAX_PLAYERS = 4;

    public Lobby(String id) {
        this.id = id;
        this.status = LobbyStatus.WAITING;
    }

    public void addPlayer(String playerId) {
        if (players.size() < MAX_PLAYERS) {
            players.add(playerId);
            if (players.size() == MAX_PLAYERS) {
                this.status = LobbyStatus.STARTED;
            }
        }
    }

    public void removePlayer(String playerId) {
        players.remove(playerId);
    }

    public boolean isFull() {
        return players.size() >= MAX_PLAYERS;
    }

    public String getId() {
        return id;
    }

    public LobbyStatus getStatus() {
        return status;
    }

    public void setStatus(LobbyStatus status) {
        this.status = status;
    }

    public Set<String> getPlayers() {
        return players;
    }

}


