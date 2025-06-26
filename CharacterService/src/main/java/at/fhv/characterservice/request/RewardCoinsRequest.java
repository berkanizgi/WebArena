package at.fhv.characterservice.request;

public class RewardCoinsRequest {
    private String playerId;
    private String characterId;
    private int amount;

    public RewardCoinsRequest(String playerId, String characterId, int amount) {
        this.playerId = playerId;
        this.characterId = characterId;
        this.amount = amount;
    }

    public RewardCoinsRequest() {
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

    public int getAmount() {
        return amount;
    }

    public void setAmount(int amount) {
        this.amount = amount;
    }
}
