package com.example.gameservice.request;

public class AttackRequest {
    private String sessionId;
    private String playerId;
    private double playerX;
    private double playerY;
    private double dirX;
    private double dirY;

    public AttackRequest() {}

    public String getPlayerId() { return playerId; }
    public void setPlayerId(String playerId) { this.playerId = playerId; }

    public double getPlayerX() { return playerX; }
    public void setPlayerX(double playerX) { this.playerX = playerX; }

    public double getPlayerY() { return playerY; }
    public void setPlayerY(double playerY) { this.playerY = playerY; }

    public double getDirX() { return dirX; }
    public void setDirX(double dirX) { this.dirX = dirX; }

    public double getDirY() { return dirY; }
    public void setDirY(double dirY) { this.dirY = dirY; }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }
}
