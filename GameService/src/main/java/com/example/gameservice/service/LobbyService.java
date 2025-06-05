package com.example.gameservice.service;

import com.example.gameservice.domain.Lobby;
import com.example.gameservice.domain.LobbyStatus;
import com.example.gameservice.domain.Player;
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
        Player owner = new Player(playerId);
        owner.setReady(false); // ← optional explizit setzen
        Lobby lobby = new Lobby(UUID.randomUUID().toString(), owner);
        lobbies.put(lobby.getId(), lobby);
        playerToLobby.put(playerId, lobby.getId());
        return lobby;
    }



    public Optional<Lobby> joinLobby(String playerId) {
        return Optional.of(createLobby(playerId)); // Jeder Spieler bekommt sofort eigene Lobby
    }


    public Lobby toggleReady(String playerId) {
        String lobbyId = playerToLobby.get(playerId);
        if (lobbyId == null) return null;

        Lobby lobby = lobbies.get(lobbyId);
        if (lobby == null) return null;

        // Ready umschalten
        lobby.getPlayers().stream()
                .filter(p -> p.getPlayerId().equals(playerId))
                .findFirst()
                .ifPresent(p -> p.setReady(!p.isReady()));

        // Alle Spieler ready?
        if (lobby.getPlayers().stream().allMatch(Player::isReady)) {
            lobby.setStatus(LobbyStatus.STARTED);
        } else {
            lobby.setStatus(LobbyStatus.WAITING);
        }

        return lobby;
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

