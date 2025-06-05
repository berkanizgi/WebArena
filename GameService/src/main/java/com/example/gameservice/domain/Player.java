package com.example.gameservice.domain;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
public class Player {

    @Id
    private String playerId;

    @Column(unique = true, nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String passwordHash;


    private int xp = 0;

    private int wallet = 0;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "character_id")
    private GameCharacter selectedCharacter;

    private Boolean ready;

    private Boolean host;


    public Player() {
        this.playerId = UUID.randomUUID().toString();
    }

    public Player(String playerId) {
        this.playerId = playerId;
        this.name = "test";

    }



    public Player(String name, GameCharacter defaultCharacter) {
        this.playerId = UUID.randomUUID().toString();
        this.name = name;
        this.selectedCharacter = defaultCharacter;
        this.xp = 0;
        this.wallet = 0;
    }

    public String getPlayerId() {
        return playerId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getXp() {
        return xp;
    }

    public void setXp(int xp) {
        this.xp = xp;
    }

    public int getWallet() {
        return wallet;
    }

    public void setWallet(int wallet) {
        this.wallet = wallet;
    }

    public GameCharacter getSelectedCharacter() {
        return selectedCharacter;
    }

    public void setSelectedCharacter(GameCharacter selectedCharacter) {
        this.selectedCharacter = selectedCharacter;
    }

    // --- Hilfsmethoden (optional) ---
    public void addXp(int amount) {
        this.xp += amount;
    }

    public void addToWallet(int amount) {
        this.wallet += amount;
    }

    public void removeFromWallet(int amount) {
        this.wallet = Math.max(0, this.wallet - amount);
    }

    public Boolean isReady() {
        return ready;
    }

    public void setReady(Boolean ready) {
        this.ready = ready;
    }

    public Boolean isHost() {
        return host;
    }

    public void setHost(Boolean host) {
        this.host = host;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }
}
