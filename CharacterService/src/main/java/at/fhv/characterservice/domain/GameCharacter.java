package at.fhv.characterservice.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class GameCharacter {
    @Id
    private String characterId;
    private String name;
    private String skin;
    private int baseHealth;
    private int baseAttack;
    private int speed;
    private String role;
    private String description;
    private Boolean rare;

    // Getter und Setter
    public String getCharacterId() { return characterId; }
    public void setCharacterId(String characterId) { this.characterId = characterId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSkin() { return skin; }
    public void setSkin(String skin) { this.skin = skin; }
    public int getBaseHealth() { return baseHealth; }
    public void setBaseHealth(int baseHealth) { this.baseHealth = baseHealth; }
    public int getBaseAttack() { return baseAttack; }
    public void setBaseAttack(int baseAttack) { this.baseAttack = baseAttack; }
    public int getSpeed() { return speed; }
    public void setSpeed(int speed) { this.speed = speed; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Boolean getRare() { return rare; }
    public void setRare(Boolean rare) { this.rare = rare; }
}