package at.fhv.characterservice.service;

import at.fhv.characterservice.domain.Wallet;
import java.util.UUID;

public interface WalletService {
    Wallet getWallet(String playerId, String characterId);
    void save(Wallet wallet);
}
