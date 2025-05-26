package com.example.gameservice.service;

import com.example.gameservice.domain.Player;
import com.example.gameservice.Repository.PlayerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

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
}
