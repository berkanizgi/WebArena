package at.fhv.characterservice.service;

import at.fhv.characterservice.domain.Wallet;
import at.fhv.characterservice.repository.WalletRepository;
import org.springframework.stereotype.Service;

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

    public void updateCharacterId(String playerId, String newCharacterId) {
        Wallet wallet = walletRepository.findByPlayerId(playerId)
                .orElseThrow(() -> new RuntimeException("Wallet not found for player: " + playerId));
        wallet.setCharacterId(newCharacterId);
        walletRepository.save(wallet);
    }

    @Override
    public String getSelectedCharacterId(String playerId) {
        Wallet wallet = walletRepository.findByPlayerId(playerId)
                .orElseThrow(() -> new RuntimeException("Wallet not found for player: " + playerId));
        return wallet.getCharacterId();
    }


}

