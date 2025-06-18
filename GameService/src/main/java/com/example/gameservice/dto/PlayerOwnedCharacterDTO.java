package com.example.gameservice.dto;

public class PlayerOwnedCharacterDTO {
    private String characterId;
    private int baseHealth;
    private int baseAttack;
    private float baseSpeed;
    private float projectileSpeed;
    private int level;
    private int nextUpgradeCost;

    // Getter + Setter
    public String getCharacterId() {
        return characterId;
    }
    public void setCharacterId(String characterId) {
        this.characterId = characterId;
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

    public float getBaseSpeed() {
        return baseSpeed;
    }
    public void setBaseSpeed(float baseSpeed) {
        this.baseSpeed = baseSpeed;
    }

    public float getProjectileSpeed() {
        return projectileSpeed;
    }
    public void setProjectileSpeed(float projectileSpeed) {
        this.projectileSpeed = projectileSpeed;
    }

    public int getLevel() {
        return level;
    }
    public void setLevel(int level) {
        this.level = level;
    }

    public int getNextUpgradeCost() {
        return nextUpgradeCost;
    }
    public void setNextUpgradeCost(int nextUpgradeCost) {
        this.nextUpgradeCost = nextUpgradeCost;
    }
}
