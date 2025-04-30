package com.example.gameservice.domain;

import java.time.Instant;

public class CharacterPosition {

    private String characterId;

    private int x;

    private int y;

    private int rotation;

    private Instant lastShotTime = Instant.EPOCH; // Instant kein LocalDateTime, weil Instant ist UCT

    public CharacterPosition(String characterId, int x, int y) {
        this.characterId = characterId;
        this.x = x;
        this.y = y;
        this.rotation = 0;

    }

    public void move(String direction, int rotation) {
        if (direction != null) {
            switch (direction) {
                case "UP" -> y -= 1;
                case "DOWN" -> y += 1;
                case "LEFT" -> x -= 1;
                case "RIGHT" -> x += 1;
            }
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

}
