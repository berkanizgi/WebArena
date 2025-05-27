package com.example.gameservice.dto;

public class HealthUpdateDTO {
    private String playerId;
    private int newHealth;

    public HealthUpdateDTO(String playerId, int newHealth) {
        this.playerId = playerId;
        this.newHealth = newHealth;
    }

    public String getPlayerId() {
        return playerId;
    }

    public int getNewHealth() {
        return newHealth;
    }
}
