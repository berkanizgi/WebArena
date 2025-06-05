package com.example.gameservice.domain;

import com.fasterxml.jackson.annotation.JsonGetter;
import jakarta.persistence.*;

import java.util.UUID;

@Entity
public class Wallet {

    @Id
    private String walletId = UUID.randomUUID().toString();

    private int xp = 0;

    private int coins = 0;

    @OneToOne
    @JoinColumn(name = "player_id", nullable = false, unique = true)
    private Player player;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "character_id")
    private GameCharacter selectedCharacter;

    // --- Konstruktoren ---
    public Wallet() {
    }

    public Wallet(Player player, GameCharacter defaultCharacter) {
        this.player = player;
        this.selectedCharacter = defaultCharacter;
    }

    // --- Getter & Setter ---
    public String getWalletId() {
        return walletId;
    }

    public int getXp() {
        return xp;
    }

    public void setXp(int xp) {
        this.xp = xp;
    }

    public int getCoins() {
        return coins;
    }

    public void setCoins(int coins) {
        this.coins = coins;
    }

    public Player getPlayer() {
        return player;
    }

    public void setPlayer(Player player) {
        this.player = player;
    }

    public GameCharacter getSelectedCharacter() {
        return selectedCharacter;
    }

    public void setSelectedCharacter(GameCharacter selectedCharacter) {
        this.selectedCharacter = selectedCharacter;
    }

    // --- Hilfsmethoden ---
    public void addXp(int amount) {
        this.xp += amount;
    }

    public void addCoins(int amount) {
        this.coins += amount;
    }

    public void removeCoins(int amount) {
        this.coins = Math.max(0, this.coins - amount);
    }

    @JsonGetter("selectedCharacterId")
    public String getSelectedCharacterId() {
        return selectedCharacter != null ? selectedCharacter.getCharacterId() : null;
    }
}
