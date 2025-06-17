package at.fhv.characterservice.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class Wallet {

    @Id
    @Column(name = "wallet_id")
    private String walletId;

    @Column(name = "coins", nullable = false)
    private int coins;

    @Column(name = "xp", nullable = false)
    private int xp;

    @Column(name = "player_id", nullable = false)
    private String playerId;

    @Column(name = "character_id", nullable = false)
    private String characterId;

    // Getter und Setter

    public String getWalletId() {
        return walletId;
    }

    public void setWalletId(String walletId) {
        this.walletId = walletId;
    }

    public int getCoins() {
        return coins;
    }

    public void setCoins(int coins) {
        this.coins = coins;
    }

    public int getXp() {
        return xp;
    }

    public void setXp(int xp) {
        this.xp = xp;
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
}
