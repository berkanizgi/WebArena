package com.example.gameservice.dto;

public class PlayerDTO {
    private String playerId;
    private String username;
    private String name;
    private int xp;
    private int wallet;
    private String selectedCharacterId;

    public PlayerDTO(String playerId, String username, String name, int xp, int wallet, String selectedCharacterId) {
        this.playerId = playerId;
        this.username = username;
        this.name = name;
        this.xp = xp;
        this.wallet = wallet;
        this.selectedCharacterId = selectedCharacterId;
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

    public int getXp() {
        return xp;
    }

    public int getWallet() {
        return wallet;
    }

    public String getSelectedCharacterId() {
        return selectedCharacterId;
    }
}
