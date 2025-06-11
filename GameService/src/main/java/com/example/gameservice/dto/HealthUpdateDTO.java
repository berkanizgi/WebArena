package com.example.gameservice.dto;

public class HealthUpdateDTO {
    private String playerId;
    private int health; // <-- statt newHealth

    public HealthUpdateDTO(String playerId, int health) {
        this.playerId = playerId;
        this.health = health;
    }

    public String getPlayerId() {
        return playerId;
    }

    public int getHealth() {
        return health;
    }

    public void setPlayerId(String playerId) {
        this.playerId = playerId;
    }

    public void setHealth(int health) {
        this.health = health;
    }
}
