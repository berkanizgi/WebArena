package com.example.gameservice.request;

public class AttackRequest {
    private int x;
    private int y;
    private int playerX;
    private int playerY;

    private String playerId;


    public AttackRequest() {
    }

    public AttackRequest(int x, int y, String playerId) {
        this.x = x;
        this.y = y;
        this.playerId = playerId;

    }

    // Getter und Setter
    public int getMouseX() { return x; }
    public void setX(int x) { this.x = x; }

    public int getMouseY() { return y; }
    public void setY(int y) { this.y = y; }

    public String getPlayerId() { return playerId; }
    public void setPlayerId(String playerId) { this.playerId = playerId; }

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
}
