package at.fhv.characterservice.service;

import at.fhv.characterservice.domain.Wallet;
import at.fhv.characterservice.repository.WalletRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class WalletServiceImpl implements WalletService {

    private final WalletRepository walletRepository;

    public WalletServiceImpl(WalletRepository walletRepository) {
        this.walletRepository = walletRepository;
    }

    @Override
    public Wallet getWallet(String playerId, String characterId) {
        return walletRepository.findByPlayerIdAndCharacterId(playerId, characterId)
                .orElseThrow(() -> new RuntimeException("Wallet not found for player: " + playerId));
    }

    @Override
    public void save(Wallet wallet) {
        walletRepository.save(wallet);
    }
}
