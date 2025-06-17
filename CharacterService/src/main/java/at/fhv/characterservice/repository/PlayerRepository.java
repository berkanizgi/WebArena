package at.fhv.characterservice.repository;

import at.fhv.characterservice.domain.Player;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlayerRepository extends JpaRepository<Player, String> {
}
