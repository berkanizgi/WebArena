package com.example.gameservice.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class PlayerOwnedCharacter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Player player;

    @ManyToOne
    private GameCharacter gameCharacter;

    private Long shopItemId;

    private int upgradeLevel = 1;

    private LocalDateTime purchaseDate = LocalDateTime.now();

    // --- Getter & Setter ---

    public Long getId() {
        return id;
    }

    public Player getPlayer() {
        return player;
    }

    public void setPlayer(Player player) {
        this.player = player;
    }

    public GameCharacter getGameCharacter() {
        return gameCharacter;
    }

    public void setGameCharacter(GameCharacter gameCharacter) {
        this.gameCharacter = gameCharacter;
    }

    public void setUpgradeLevel(int upgradeLevel) {
        this.upgradeLevel = upgradeLevel;
    }

    public int getUpgradeLevel() {
        return upgradeLevel;
    }

    public void setPurchaseDate(LocalDateTime purchaseDate) {
        this.purchaseDate = purchaseDate;
    }

    public LocalDateTime getPurchaseDate() {
        return purchaseDate;
    }
}
