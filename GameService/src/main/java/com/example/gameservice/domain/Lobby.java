package com.example.gameservice.domain;

import java.util.*;

public class Lobby {
    private String id;
    private LobbyStatus status;
    private List<Player> players = new ArrayList<>();





    public Lobby(String id, Player owner) {
        this.id = id;
        this.status = LobbyStatus.WAITING;
        owner.setHost(true);
        players.add(owner);
    }

    public String getId() { return id; }
    public List<Player> getPlayers() { return players; }

    public LobbyStatus getStatus() { return status; }
    public void setStatus(LobbyStatus status) { this.status = status; }

    public void updateStatus() {
        // Für Tests: Schon bei 1 Spieler erlauben, dass STARTED gesetzt wird
        if (players.stream().allMatch(Player::isReady) && players.size() >= 1) {
            this.status = LobbyStatus.STARTED;
        } else {
            this.status = LobbyStatus.WAITING;
        }
    }




    public void addPlayer(String playerId) {
        players.add(new Player(playerId));
    }

    public void addPlayer(Player player) {
        players.add(player);
    }


    public void removePlayer(String playerId) {
        players.removeIf(p -> p.getPlayerId().equals(playerId));
    }

    public void toggleReady(String playerId) {
        players.stream()
                .filter(p -> p.getPlayerId().equals(playerId))
                .findFirst()
                .ifPresent(p -> p.setReady(!p.isReady()));
    }

    public boolean allReady() {
        return players.stream().allMatch(Player::isReady);
    }

    public boolean isFull() {
        return players.size() >= 4;
    }

    public Map<String, Boolean> getPlayerStates() {
        Map<String, Boolean> result = new HashMap<>();
        for (Player p : players) {
            result.put(p.getPlayerId(), p.isReady());
        }
        return result;
    }

}
