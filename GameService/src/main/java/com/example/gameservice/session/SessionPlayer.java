package com.example.gameservice.session;

public class SessionPlayer {
    private String playerId;
    private String characterId;
    private String characterName;
    private int baseHealth;
    private int baseAttack;
    private int speed;
    private boolean isDead = false;


    public SessionPlayer(String playerId, String characterId, String characterName, int baseHealth, int baseAttack, int speed) {
        this.playerId = playerId;
        this.characterId = characterId;
        this.characterName = characterName;
        this.baseHealth = baseHealth;
        this.baseAttack = baseAttack;
        this.speed = speed;
    }

    public String getPlayerId() {
        return playerId;
    }

    public void setPlayerId(String playerId) {
        this.playerId = playerId;
    }

    public String getCharacterId() {
        return characterId;
    }

    public void setCharacterId(String characterId) {
        this.characterId = characterId;
    }

    public String getCharacterName() {
        return characterName;
    }

    public void setCharacterName(String characterName) {
        this.characterName = characterName;
    }

    public int getBaseHealth() {
        return baseHealth;
    }

    public void setBaseHealth(int baseHealth) {
        this.baseHealth = baseHealth;
    }

    public int getBaseAttack() {
        return baseAttack;
    }

    public void setBaseAttack(int baseAttack) {
        this.baseAttack = baseAttack;
    }

    public int getSpeed() {
        return speed;
    }

    public void setSpeed(int speed) {
        this.speed = speed;
    }

    public boolean isDead() {
        return isDead;
    }

    public void setDead(boolean dead) {
        isDead = dead;
    }

    // Getter + Setter
}
