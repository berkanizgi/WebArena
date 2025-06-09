package com.example.gameservice.request;
public class MovementRequest {
    private String playerId;
    private String direction;
    private int rotation;
    private int x;
    private int y;
    private String characterId;
    private Boolean isMoving;

    public MovementRequest() {}

    public String getPlayerId() { return playerId; }
    public void setPlayerId(String playerId) { this.playerId = playerId; }

    public String getDirection() { return direction; }
    public void setDirection(String direction) { this.direction = direction; }

    public int getRotation() { return rotation; }
    public void setRotation(int rotation) { this.rotation = rotation; }

    public int getX() { return x; }
    public void setX(int x) { this.x = x; }

    public int getY() { return y; }
    public void setY(int y) { this.y = y; }

    public String getCharacterId() { return characterId; } // ⬅️ neu
    public void setCharacterId(String characterId) { this.characterId = characterId; } // ⬅️ neu

    public Boolean getIsMoving() { return isMoving; }
    public void setIsMoving(Boolean isMoving) { this.isMoving = isMoving; }
}

