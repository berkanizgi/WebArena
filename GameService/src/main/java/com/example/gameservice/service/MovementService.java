package com.example.gameservice.service;

import com.example.gameservice.Repository.CharacterRepository;
import com.example.gameservice.domain.CharacterPosition;
import com.example.gameservice.dto.CharacterPositionDTO;
import com.example.gameservice.request.MovementRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import com.example.gameservice.infrastructure.CollisionMapLoader;
import com.example.gameservice.domain.GameCharacter;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class MovementService {

    private final Map<String, Map<String, CharacterPosition>> sessionPositions = new ConcurrentHashMap<>();
    private final SimpMessagingTemplate messagingTemplate;
    private final boolean[][] blocked = new CollisionMapLoader().loadCollisionMap();

    @Autowired
    public CharacterRepository characterRepository;

    public MovementService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public CharacterPosition moveCharacter(String sessionId, MovementRequest request) {
        Map<String, CharacterPosition> positions = sessionPositions.computeIfAbsent(sessionId, id -> new ConcurrentHashMap<>());

        CharacterPosition pos = positions.computeIfAbsent(
                request.getPlayerId(),
                id -> {
                    GameCharacter character = characterRepository.findById(request.getCharacterId()).orElse(null);
                    if (character == null) return null;
                    return new CharacterPosition(id, character, request.getX(), request.getY());
                }
        );
        if (pos == null) return null;

        int targetX = request.getX();
        int targetY = request.getY();

        int tileSize = 32;
        int tileX = targetX / tileSize;
        int tileY = targetY / tileSize;

        // Optional: Mapgrenzen/Kollision
        // if (tileY < 0 || tileY >= blocked.length || tileX < 0 || tileX >= blocked[0].length || blocked[tileY][tileX]) {
        //     return pos;
        // }

        pos.setX(targetX);
        pos.setY(targetY);
        pos.setDirection(request.getDirection());
        pos.setRotation(request.getRotation());
        pos.setIsMoving(request.getIsMoving());

        return pos;
    }

    public void moveAndBroadcast(String sessionId, MovementRequest request) {
        CharacterPosition updated = moveCharacter(sessionId, request);
        if (updated == null) return;
        if (sessionId == null) {
            System.err.println("[ERROR] sessionId ist null in moveAndBroadcast");
        }


        messagingTemplate.convertAndSend("/topic/movement/" + sessionId, new CharacterPositionDTO(updated));
    }

    public List<CharacterPositionDTO> getAllPositions(String sessionId) {
        Map<String, CharacterPosition> positions = sessionPositions.get(sessionId);
        if (positions == null) return List.of();
        return positions.values().stream().map(CharacterPositionDTO::new).collect(Collectors.toList());
    }

    public void registerInitialCharacter(String sessionId, String playerId, GameCharacter character) {
        Map<String, CharacterPosition> positions = sessionPositions.computeIfAbsent(sessionId, id -> new ConcurrentHashMap<>());
        positions.put(playerId, new CharacterPosition(playerId, character, 100, 100));
    }

    public Collection<CharacterPosition> getAllRawPositions(String sessionId) {
        Map<String, CharacterPosition> positions = sessionPositions.get(sessionId);
        return positions != null ? positions.values() : List.of();
    }

    public CharacterPosition getCharacterPosition(String sessionId, String playerId) {
        Map<String, CharacterPosition> positions = sessionPositions.get(sessionId);
        if (positions == null) return null;
        return positions.get(playerId);
    }


}
