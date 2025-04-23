package com.example.gameservice.domain;

public class CharacterPosition {
    private String characterId;
    private int x;
    private int y;

    public CharacterPosition(String characterId, int x, int y) {
        this.characterId = characterId;
        this.x = x;
        this.y = y;
    }

    public void move(String direction) {
        switch (direction) {
            case "UP" -> y -= 1;
            case "DOWN" -> y += 1;
            case "LEFT" -> x -= 1;
            case "RIGHT" -> x += 1;
        }
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
}
