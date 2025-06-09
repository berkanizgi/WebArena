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

    private final Map<String, CharacterPosition> positions = new ConcurrentHashMap<>();

    private final SimpMessagingTemplate messagingTemplate;

    private final boolean[][] blocked = new CollisionMapLoader().loadCollisionMap();

    @Autowired
    public CharacterRepository characterRepository;

    public MovementService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }


    public CharacterPosition getCharacterPosition(String playerId) {
        return positions.get(playerId);
    }

    public CharacterPosition moveCharacter(MovementRequest request) {
        CharacterPosition pos = positions.computeIfAbsent(
                request.getPlayerId(),
                id -> {
                    GameCharacter character = characterRepository.findById(request.getCharacterId()).orElse(null); // ✅ neu
                    if (character == null) {
                        System.out.println("[ERROR] Character mit ID '" + request.getCharacterId() + "' nicht gefunden!");
                        return null;
                    }
                    return new CharacterPosition(id, character, request.getX(), request.getY());
                }
        );
        if (pos == null) return null;

        // Neue Zielkoordinaten (du willst weiterhin absolute Bewegung):
        int targetX = request.getX();
        int targetY = request.getY();

        int tileSize = 32; // ODER 16! Je nach eurer Map. (Bitte ggf. angleichen!)
        int tileX = targetX / tileSize;
        int tileY = targetY / tileSize;

        // **Hier: Kollision + Grenzen prüfen wie bei deinem Kollegen**
//        if (tileY < 0 || tileY >= blocked.length || tileX < 0 || tileX >= blocked[0].length || blocked[tileY][tileX]) {
//            return pos; // Blockiert oder außerhalb der Map
//        }

        // Bewegung ist erlaubt → Zielposition setzen
        pos.setX(targetX);
        pos.setY(targetY);
        pos.setDirection(request.getDirection());
        pos.setRotation(request.getRotation());
        pos.setIsMoving(request.getIsMoving());

        return pos;
    }



    public void moveAndBroadcast(MovementRequest request) {
        CharacterPosition updated = moveCharacter(request);
        if (updated == null) {
            return;
        }

        messagingTemplate.convertAndSend("/topic/movement", new CharacterPositionDTO(updated));
    }

    public List<CharacterPositionDTO> getAllPositions() {
        return positions.values().stream()
                .map(CharacterPositionDTO::new)
                .collect(Collectors.toList());
    }
    public void registerInitialCharacter(String playerId, GameCharacter character) {
        CharacterPosition newPos = new CharacterPosition(playerId, character, 100, 100);
        positions.put(playerId, newPos);
    }


    public Collection<CharacterPosition> getAllRawPositions() {
        return positions.values();
    }



//    public void updateRotation(MovementRequest request) {
//        CharacterPosition pos = positions.computeIfAbsent(
//                request.getCharacterId(),
//                id -> characterRepository.findById(id).orElse(null)
//        );
//        if (pos != null) {
//            pos.setRotation(request.getRotation());
//            CharacterPositionDTO dto = new CharacterPositionDTO(pos);
//            messagingTemplate.convertAndSend("/topic/movement", dto);
//        }
//    }
}

