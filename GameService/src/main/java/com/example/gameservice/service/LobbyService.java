package com.example.gameservice.service;

import com.example.gameservice.domain.Lobby;
import com.example.gameservice.domain.LobbyStatus;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
@Service
public class LobbyService {

    private final Map<String, Lobby> lobbies = new ConcurrentHashMap<>();
    private final Map<String, String> playerToLobby = new ConcurrentHashMap<>();

    public Lobby createLobby(String playerId) {
        Lobby lobby = new Lobby(UUID.randomUUID().toString());
        lobby.addPlayer(playerId);
        lobbies.put(lobby.getId(), lobby);
        playerToLobby.put(playerId, lobby.getId());
        return lobby;
    }

    public Optional<Lobby> joinLobby(String playerId) {
        for (Lobby lobby : lobbies.values()) {
            if (lobby.getStatus() == LobbyStatus.WAITING && !lobby.isFull()) {
                lobby.addPlayer(playerId);
                playerToLobby.put(playerId, lobby.getId());
                return Optional.of(lobby);
            }
        }
        return Optional.of(createLobby(playerId));
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
