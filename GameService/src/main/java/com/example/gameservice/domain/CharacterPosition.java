package com.example.gameservice.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
public class CharacterPosition {

    @Id
    private String playerId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "character_id")
    private GameCharacter gameCharacter;

    private int x;
    private int y;
    private int rotation;
    private String direction;
    private Boolean isMoving;
    private Instant lastShotTime;

    // --- Konstruktoren ---

    public CharacterPosition() {
    }

    public CharacterPosition(String playerId, GameCharacter gameCharacter, int x, int y) {
        this.playerId = playerId;
        this.gameCharacter = gameCharacter;
        this.x = x;
        this.y = y;
        this.rotation = 0;
        this.direction = "down";
        this.isMoving = false;
        this.lastShotTime = Instant.EPOCH;
    }

    public String getPlayerId() {
        return playerId;
    }

    public void setPlayerId(String playerId) {
        this.playerId = playerId;
    }

    public GameCharacter getCharacter() {
        return gameCharacter;
    }

    public void setCharacter(GameCharacter character) {
        this.gameCharacter = character;
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

    public String getDirection() {
        return direction;
    }

    public void setDirection(String direction) {
        this.direction = direction;
    }

    public Boolean getIsMoving() {
        return isMoving;
    }

    public void setIsMoving(Boolean isMoving) {
        this.isMoving = isMoving;
    }

    public Instant getLastShotTime() {
        return lastShotTime;
    }

    public void setLastShotTime(Instant lastShotTime) {
        this.lastShotTime = lastShotTime;
    }

    // --- Nützliche Methoden ---

    public boolean canAttack(Instant now, long cooldownMillis) {
        return now.isAfter(lastShotTime.plusMillis(cooldownMillis));
    }

    public void registerAttack(Instant now) {
        this.lastShotTime = now;
    }

    public String getSkin() {
        return gameCharacter != null ? gameCharacter.getSkin() : null;
    }
    public int getAttack() {
        return gameCharacter != null ? gameCharacter.getBaseAttack() : 0;
    }
// usw.

}
