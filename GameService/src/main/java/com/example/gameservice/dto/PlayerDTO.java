package com.example.gameservice.dto;

import com.example.gameservice.domain.Player;
import com.example.gameservice.domain.Wallet;

public class PlayerDTO {
    private String playerId;
    private String username;
    private String name;
    private Boolean ready;
    private Boolean host;
    private Wallet wallet;

    public PlayerDTO(Player player) {
        this.playerId = player.getPlayerId();
        this.username = player.getUsername();
        this.name = player.getName();
        this.ready = player.isReady();
        this.host = player.isHost();
        this.wallet = player.getWallet(); // enthält xp, coins, selectedCharacter
    }

    // Getter
    public String getPlayerId() {
        return playerId;
    }

    public String getUsername() {
        return username;
    }

    public String getName() {
        return name;
    }

    public Boolean getReady() {
        return ready;
    }

    public Boolean getHost() {
        return host;
    }

    public Wallet getWallet() {
        return wallet;
    }
}
