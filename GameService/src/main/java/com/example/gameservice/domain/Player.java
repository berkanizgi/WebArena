package com.example.gameservice.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.io.Serializable;
import java.util.UUID;

@JsonIgnoreProperties({"wallet", "passwordHash"})@Entity
public class Player implements Serializable {

    @Id
    private String playerId;

    @Column(unique = true, nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String passwordHash;

    private Boolean host;

    @OneToOne(mappedBy = "player", cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    private Wallet wallet;

    @ManyToOne
    @JoinColumn(name = "selected_character_character_id")
    private GameCharacter selectedCharacter;

    @ManyToOne
    @JoinColumn(name = "character_id")
    private GameCharacter character;


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

    public Wallet getWallet() {
        return wallet;
    }

    public void setWallet(Wallet wallet) {
        this.wallet = wallet;
    }

    public Boolean getHost() {
        return host;
    }

    public void setPlayerId(String playerId) {
        this.playerId = playerId;
    }

    public GameCharacter getSelectedCharacter() {
        return selectedCharacter;
    }

    public void setSelectedCharacter(GameCharacter selectedCharacter) {
        this.selectedCharacter = selectedCharacter;
    }

    public GameCharacter getCharacter() {
        return character;
    }

    public void setCharacter(GameCharacter character) {
        this.character = character;
    }
}
