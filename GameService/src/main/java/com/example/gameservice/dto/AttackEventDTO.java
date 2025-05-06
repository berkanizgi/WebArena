package com.example.gameservice.dto;

public class AttackEventDTO {
    private String playerId;
    private int playerX;
    private int playerY;
    private double dirX;
    private double dirY;

    public AttackEventDTO(String playerId, int playerX, int playerY, double dirX, double dirY) {
        this.playerId = playerId;
        this.playerX = playerX;
        this.playerY = playerY;
        this.dirX = dirX;
        this.dirY = dirY;
    }

    // Getter

    public String getPlayerId() {
        return playerId;
    }

    public void setPlayerId(String playerId) {
        this.playerId = playerId;
    }

    public int getPlayerX() {
        return playerX;
    }

    public void setPlayerX(int playerX) {
        this.playerX = playerX;
    }

    public int getPlayerY() {
        return playerY;
    }

    public void setPlayerY(int playerY) {
        this.playerY = playerY;
    }

    public double getDirX() {
        return dirX;
    }

    public void setDirX(double dirX) {
        this.dirX = dirX;
    }

    public double getDirY() {
        return dirY;
    }

    public void setDirY(double dirY) {
        this.dirY = dirY;
    }
}

