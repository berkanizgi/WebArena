package com.example.gameservice.dto;

import com.example.gameservice.domain.CharacterPosition;

public class CharacterPositionDTO {

    private String characterId;
    private int x;
    private int y;
    private int rotation;
    String direction;

    public CharacterPositionDTO(CharacterPosition position) {
        this.characterId = position.getCharacterId();
        this.x = position.getX();
        this.y = position.getY();
        this.rotation = position.getRotation();
        this.direction = position.getDirection();
    }

    public String getCharacterId() {
        return characterId;
    }

    public void setCharacterId(String characterId) {
        this.characterId = characterId;
    }

    public int getX() {
        return x;
    }

    public int getY() {
        return y;
    }

    public void setX(int x) {
        this.x = x;
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
}

