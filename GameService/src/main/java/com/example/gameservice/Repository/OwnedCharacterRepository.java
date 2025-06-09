package com.example.gameservice.Repository;

import com.example.gameservice.domain.PlayerOwnedCharacter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface OwnedCharacterRepository extends JpaRepository<PlayerOwnedCharacter, Long> {

    @Query("SELECT poc.gameCharacter.characterId FROM PlayerOwnedCharacter poc WHERE poc.player.playerId = :playerId")
    List<String> findCharacterIdsByPlayerId(@Param("playerId") String playerId);
}
