package com.example.gameservice.service;

import com.example.gameservice.Repository.GameCharacterRepository;
import com.example.gameservice.domain.GameCharacter;
import com.example.gameservice.domain.Player;
import com.example.gameservice.Repository.PlayerRepository;
import com.example.gameservice.domain.Wallet;
import com.example.gameservice.dto.PlayerDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PlayerService {

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
        player.setWallet(wallet);

        return playerRepository.save(player); // durch Cascade wird Wallet mitgespeichert
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
