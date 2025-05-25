package com.example.gameservice.dto;

import com.example.gameservice.domain.CharacterPosition;

import java.time.Instant;

public class CharacterPositionDTO {

    private String characterId;
    private int x;
    private int y;
    private int rotation;
    private String name;
    private String skin;
    private String baseStats;
    private String role;
    private String description;
    private Boolean rare;
    private Long speed;
    private String direction;
    private Boolean isMoving;


    public CharacterPositionDTO(CharacterPosition position) {
        this.characterId = position.getCharacterId();
        this.x = position.getX();
        this.y = position.getY();
        this.rotation = position.getRotation();
        this.direction = position.getDirection();
        this.skin = position.getSkin();
        this.isMoving = position.getIsMoving();
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

    public String getDirection() {
        return direction != null ? direction : "down";
    }

    public void setDirection(String direction) {
        this.direction = direction;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSkin() {
        return skin;
    }

    public void setSkin(String skin) {
        this.skin = skin;
    }

    public String getBaseStats() {
        return baseStats;
    }

    public void setBaseStats(String baseStats) {
        this.baseStats = baseStats;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getRare() {
        return rare;
    }

    public void setRare(Boolean rare) {
        this.rare = rare;
    }

    public Long getSpeed() {
        return speed;
    }

    public void setSpeed(Long speed) {
        this.speed = speed;
    }

    public Boolean getIsMoving() {
        return isMoving;
    }

    public void setIsMoving(Boolean moving) {
        isMoving = moving;
    }
}

