package at.fhv.characterservice.repository;

import at.fhv.characterservice.domain.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, UUID> {
    Optional<Wallet> findByPlayerId(String playerId);

    Optional<Wallet> findByPlayerIdAndCharacterId(String playerId, String characterId);

}
