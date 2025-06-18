package at.fhv.characterservice.request;

public class AddOwnedCharacterRequest {
    private String playerId;
    private String characterId;

    public AddOwnedCharacterRequest() {}

    public AddOwnedCharacterRequest(String playerId, String characterId) {
        this.playerId = playerId;
        this.characterId = characterId;
    }

    public String getPlayerId() {
        return playerId;
    }

    public String getCharacterId() {
        return characterId;
    }

    public void setPlayerId(String playerId) {
        this.playerId = playerId;
    }

    public void setCharacterId(String characterId) {
        this.characterId = characterId;
    }
}
