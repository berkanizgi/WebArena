package com.example.gameservice.domain;

public class CharacterPosition {
    private String characterId;
    private int x;
    private int y;
    private int rotation;

    public CharacterPosition(String characterId, int x, int y) {
        this.characterId = characterId;
        this.x = x;
        this.y = y;
        this.rotation = 0;
    }

    public void move(String direction, int rotation) {
        switch (direction) {
            case "UP" -> y -= 1;
            case "DOWN" -> y += 1;
            case "LEFT" -> x -= 1;
            case "RIGHT" -> x += 1;
        }
        this.rotation = rotation;
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
}
