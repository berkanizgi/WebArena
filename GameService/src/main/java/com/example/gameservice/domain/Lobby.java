package com.example.gameservice.domain;

import java.util.*;

public class Lobby {
    private String id;
    private String status;
    private List<Player> players = new ArrayList<>();

    public Lobby(String id, Player owner) {
        this.id = id;
        this.status = "WAITING";
        owner.setHost(true);
        players.add(owner);
    }

    public String getId() { return id; }
    public String getStatus() { return status; }
    public List<Player> getPlayers() { return players; }

    public void setStatus(String status) { this.status = status; }

    public void updateStatus() {
        boolean allReady = players.stream().allMatch(Player::isReady);
        this.status = allReady ? "READY" : "WAITING";
    }
}
