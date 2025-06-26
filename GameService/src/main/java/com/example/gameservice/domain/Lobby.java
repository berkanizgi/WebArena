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




    public void addPlayer(String playerId) {
        players.add(new Player(playerId));
    }

    public void addPlayer(Player player) {
        players.add(player);
    }


    public void removePlayer(String playerId) {
        players.removeIf(p -> p.getPlayerId().equals(playerId));
    }





}
