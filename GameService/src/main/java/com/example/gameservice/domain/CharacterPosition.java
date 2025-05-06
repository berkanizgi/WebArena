package com.example.gameservice.domain;

import java.time.Instant;

public class CharacterPosition {

    private String characterId;

    private int x;

    private int y;

    private int rotation;

    private String direction;

    private Instant lastShotTime = Instant.EPOCH; // Instant kein LocalDateTime, weil Instant ist UCT

    public CharacterPosition(String characterId, int x, int y) {
        this.characterId = characterId;
        this.x = x;
        this.y = y;
        this.rotation = 0;
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
}
