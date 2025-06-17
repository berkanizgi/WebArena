package com.example.gameservice.dto;

import com.example.gameservice.domain.CharacterPosition;

public class CharacterPositionDTO {

    private String playerId;
    private int x;
    private int y;
    private int rotation;
    private String skin;
    private String direction;
    private Boolean isMoving;


    public CharacterPositionDTO(CharacterPosition position) {
        this.playerId = position.getPlayerId();
        this.x = position.getX();
        this.y = position.getY();
        this.rotation = position.getRotation();
        this.direction = position.getDirection();
        this.skin = position.getSkin(); // ✅ Zugriff auf GameCharacter
        this.isMoving = position.getIsMoving();
    }

    public String getPlayerId() {
        return playerId;
    }

    public void setPlayerId(String playerId) {
        this.playerId = playerId;
    }

    public int getX() {
        return x;
    }

    public void setX(int x) {
        this.x = x;
    }

    public int getY() {
        return y;
    }

    public void setY(int y) {
        this.y = y;
    }

    public int getRotation() {
        return rotation;
    }

    public void setRotation(int rotation) {
        this.rotation = rotation;
    }

    public String getSkin() {
        return skin;
    }

    public void setSkin(String skin) {
        this.skin = skin;
    }

    public String getDirection() {
        return direction;
    }

    public void setDirection(String direction) {
        this.direction = direction;
    }

    public Boolean getIsMoving() {
        return isMoving;
    }

    public void setIsMoving(Boolean moving) {
        isMoving = moving;
    }
}

