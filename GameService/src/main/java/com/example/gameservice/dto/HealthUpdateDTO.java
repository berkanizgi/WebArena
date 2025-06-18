package com.example.gameservice.dto;

public class HealthUpdateDTO {
    private String playerId;
    private int health; // current health eigentlich
    private int baseHealth;

    public HealthUpdateDTO(String playerId, int health, int baseHealth) {
        this.playerId = playerId;
        this.health = health;
        this.baseHealth = baseHealth;
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

    public int getBaseHealth() {
        return baseHealth;
    }

    public void setBaseHealth(int baseHealth) {
        this.baseHealth = baseHealth;
    }
}
