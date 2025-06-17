package at.fhv.characterservice.domain;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
public class Player {
    @Id
    private String playerId;

    @ManyToOne
    private GameCharacter selectedCharacter;

    public Player() {
        this.playerId = UUID.randomUUID().toString();
    }

    public String getPlayerId() {
        return playerId;
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
}
