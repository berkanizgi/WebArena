package com.example.gameservice.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

import java.time.Instant;

@Entity
public class CharacterPosition {

    @Id
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
    private Instant lastShotTime = Instant.EPOCH; // Instant kein LocalDateTime, weil Instant ist UCT

    public CharacterPosition(String characterId, int x, int y) {
        this.characterId = characterId;
        this.x = x;
        this.y = y;
        this.rotation = 0;
    }

    public CharacterPosition(){

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

    public Instant getLastShotTime() {
        return lastShotTime;
    }

    public void setLastShotTime(Instant lastShotTime) {
        this.lastShotTime = lastShotTime;
    }

    public boolean canAttack(Instant now, long cooldownMillis) {
        return now.isAfter(lastShotTime.plusMillis(cooldownMillis));
    }

    public void registerAttack(Instant now) {
        this.lastShotTime = now;
    }

    public String getDirection() {
        return direction;
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

    public String getSkin() {
        return skin;
    }

    public void setSkin(String skin) {
        this.skin = skin;
    }

}
