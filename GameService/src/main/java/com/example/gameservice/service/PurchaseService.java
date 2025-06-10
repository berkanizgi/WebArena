package com.example.gameservice.service;

import com.example.gameservice.Repository.GameCharacterRepository;
import com.example.gameservice.Repository.OwnedCharacterRepository;
import com.example.gameservice.Repository.PlayerRepository;
import com.example.gameservice.domain.GameCharacter;
import com.example.gameservice.domain.Player;
import com.example.gameservice.domain.PlayerOwnedCharacter;
import com.example.gameservice.domain.Wallet;
import com.example.gameservice.dto.WalletDTO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class PurchaseService {

    private final PlayerRepository playerRepository;

    private final OwnedCharacterRepository ownedCharacterRepository;

    @Autowired
    private GameCharacterRepository gameCharacterRepository;

    public PurchaseService(PlayerRepository playerRepository, OwnedCharacterRepository ownedCharacterRepository) {
        this.playerRepository = playerRepository;
        this.ownedCharacterRepository = ownedCharacterRepository;
    }

    // Wallet lesen
    public WalletDTO getWalletByPlayerId(String playerId) {
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new RuntimeException("Player not found"));

        Wallet wallet = player.getWallet();
        return new WalletDTO(wallet.getXp(), wallet.getCoins(), wallet.getSelectedCharacterId());
    }

    // Wallet updaten (nur Coins und XP)
    public void updateWallet(String playerId, WalletDTO walletDTO) {
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new RuntimeException("Player not found"));

        Wallet wallet = player.getWallet();
        wallet.setCoins(walletDTO.coins());
        wallet.setXp(walletDTO.xp());

        playerRepository.save(player);
    }

    public void addOwnedCharacter(String playerId, String characterId) {
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new RuntimeException("Player not found"));

        GameCharacter gameCharacter = gameCharacterRepository.findById(characterId)
                .orElseThrow(() -> new RuntimeException("Character not found"));

        PlayerOwnedCharacter ownedCharacter = new PlayerOwnedCharacter();
        ownedCharacter.setPlayer(player);
        ownedCharacter.setGameCharacter(gameCharacter);
        ownedCharacter.setUpgradeLevel(1);
        ownedCharacter.setPurchaseDate(LocalDateTime.now());

        ownedCharacterRepository.save(ownedCharacter);
    }
}
