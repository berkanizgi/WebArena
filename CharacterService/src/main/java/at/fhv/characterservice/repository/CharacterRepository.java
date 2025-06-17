package at.fhv.characterservice.repository;

import at.fhv.characterservice.domain.GameCharacter;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CharacterRepository extends JpaRepository<GameCharacter, String> {
    Optional<GameCharacter> findBySkin(String skin);
}