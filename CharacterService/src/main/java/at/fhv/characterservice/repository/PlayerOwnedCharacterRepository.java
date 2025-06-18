package at.fhv.characterservice.repository;

import at.fhv.characterservice.domain.Player;
import at.fhv.characterservice.domain.PlayerOwnedCharacter;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PlayerOwnedCharacterRepository extends JpaRepository<PlayerOwnedCharacter, Long> {
    List<PlayerOwnedCharacter> findByPlayer(Player player);

    Optional<PlayerOwnedCharacter> findByPlayerAndGameCharacter_CharacterId(Player player, String characterId);

}
