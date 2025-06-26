package com.example.gameservice.service;

import com.example.gameservice.Repository.PlayerRepository;
import com.example.gameservice.domain.Lobby;
import com.example.gameservice.domain.LobbyStatus;
import com.example.gameservice.domain.Player;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
@Service
public class LobbyService {
    @Autowired
    public PlayerRepository playerRepository;

    private final Map<String, Lobby> lobbies = new ConcurrentHashMap<>();
    private final Map<String, String> playerToLobby = new ConcurrentHashMap<>();

    public Lobby createLobby(String playerId) {
        Player dbPlayer = playerRepository.findById(playerId).orElseThrow(() ->
                new IllegalArgumentException("Player nicht gefunden: " + playerId)
        );

        Lobby lobby = new Lobby(UUID.randomUUID().toString(), dbPlayer);
        lobbies.put(lobby.getId(), lobby);
        playerToLobby.put(playerId, lobby.getId());
        return lobby;
    }




    public Optional<Lobby> joinLobby(String playerId) {
        return Optional.of(createLobby(playerId)); // Jeder Spieler bekommt sofort eigene Lobby
    }



    public void removePlayer(String playerId) {
        String lobbyId = playerToLobby.remove(playerId);
        if (lobbyId != null) {
            Lobby lobby = lobbies.get(lobbyId);
            if (lobby != null) {
                lobby.removePlayer(playerId);
                if (lobby.getPlayers().isEmpty()) {
                    lobbies.remove(lobbyId);
                } else if (lobby.getStatus() == LobbyStatus.STARTED && lobby.getPlayers().size() < 4) {
                    lobby.setStatus(LobbyStatus.WAITING);
                }
            }
        }
    }

    public Collection<Lobby> getAllLobbies() {
        return lobbies.values();
    }

    public Lobby getLobby(String id) {
        return lobbies.get(id);
    }
}

