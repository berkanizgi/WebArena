package com.example.gameservice.dto;

public class MovementRequest {
    private String characterId;
    private String direction; //e.g. "UP" "DOWN" usw.
    private int rotation;

    public MovementRequest(){}
    public String getCharacterId() {
        return characterId;
    }

    public void setCharacterId(String characterId) {
        this.characterId = characterId;
    }

    public String getDirection() {
        return direction;
    }

    public void setDirection(String direction) {
        this.direction = direction;
    }

    public int getRotation() {
        return rotation;
    }

    public void setRotation(int rotation) {
        this.rotation = rotation;
    }
}
