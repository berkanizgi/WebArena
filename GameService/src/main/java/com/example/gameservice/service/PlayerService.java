package com.example.gameservice.service;

import com.example.gameservice.Repository.GameCharacterRepository;
import com.example.gameservice.Repository.OwnedCharacterRepository;
import com.example.gameservice.domain.GameCharacter;
import com.example.gameservice.domain.Player;
import com.example.gameservice.Repository.PlayerRepository;
import com.example.gameservice.domain.PlayerOwnedCharacter;
import com.example.gameservice.domain.Wallet;
import com.example.gameservice.dto.PlayerDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PlayerService {

    @Autowired
    private OwnedCharacterRepository ownedCharacterRepository;

    private final PlayerRepository playerRepository;
    private int lastIndex = -1;

    @Autowired
    public PlayerService(PlayerRepository playerRepository) {
        this.playerRepository = playerRepository;
    }

    public List<Player> getAllPlayers() {
        return playerRepository.findAll();
    }

    // das gibt nächstenSpieler von der Tabelle an, nachher wenn wir Login haben geht die methode weg
    public synchronized Player getNextPlayer() {
        List<Player> all = playerRepository.findAll();
        if (all.isEmpty()) return null;
        lastIndex = (lastIndex + 1) % all.size();
        return all.get(lastIndex);
    }

    public Player getPlayerById(String id) {
        return playerRepository.findById(id).orElse(null);
    }


    public PlayerDTO getPlayerDtoById(String id) {
        Player player = playerRepository.findById(id).orElse(null);
        if (player == null) return null;

        return new PlayerDTO(player);

    }

    public Player registerNewPlayer(String username, String passwordHash, GameCharacter defaultCharacter) {
        Player player = new Player();
        player.setUsername(username);
        player.setPasswordHash(passwordHash);
        player.setName(username); // fallback

        Wallet wallet = new Wallet(player, defaultCharacter);
        wallet.setCoins(100); // Start-Credits
        player.setWallet(wallet);

        // Player speichern
        Player savedPlayer = playerRepository.save(player);

        // --- PlayerOwnedCharacter anlegen ---
        PlayerOwnedCharacter ownedCharacter = new PlayerOwnedCharacter();
        ownedCharacter.setPlayer(savedPlayer);
        ownedCharacter.setGameCharacter(defaultCharacter);
        ownedCharacter.setBaseHealth(1300);
        ownedCharacter.setBaseAttack(150);
        ownedCharacter.setBaseSpeed(100);
        ownedCharacter.setProjectileSpeed(10);
        ownedCharacter.setLevel(1);
        ownedCharacter.setNextUpgradeCost(1000);
        ownedCharacter.setPurchaseDate(LocalDateTime.now());
        ownedCharacter.setUpgradeLevel(1);

        ownedCharacterRepository.save(ownedCharacter);

        return savedPlayer;
    }




    public Optional<Player> getByUsername(String username) {
        Player player = playerRepository.findByUsername(username);
        return Optional.ofNullable(player);
    }

    @Autowired
    private GameCharacterRepository gameCharacterRepository;

    public boolean updateSelectedCharacter(String playerId, String characterId) {
        Optional<Player> optionalPlayer = playerRepository.findById(playerId);
        Optional<GameCharacter> optionalCharacter = gameCharacterRepository.findById(characterId);

        if (optionalPlayer.isPresent() && optionalCharacter.isPresent()) {
            Player player = optionalPlayer.get();
            GameCharacter character = optionalCharacter.get();

            player.setSelectedCharacter(character);
            player.setCharacter(character); // <- DAS HINZUFÜGEN!

            playerRepository.save(player);
            return true;
        }

        return false;
    }




}
