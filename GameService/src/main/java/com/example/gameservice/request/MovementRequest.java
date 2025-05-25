package com.example.gameservice.request;

public class MovementRequest {
    private String characterId;
    private String direction; //e.g. "UP" "DOWN" usw.
    private int rotation;
    private int x;
    private int y;
    private String skin;

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

    public void setRotation(int rotation){
        this.rotation = rotation;
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

    public String getSkin() {
        return skin;
    }

    public void setSkin(String skin) {
        this.skin = skin;
    }
}
