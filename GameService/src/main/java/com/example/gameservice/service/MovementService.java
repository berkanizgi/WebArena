package com.example.gameservice.service;

import com.example.gameservice.Repository.CharacterRepository;
import com.example.gameservice.domain.CharacterPosition;
import com.example.gameservice.dto.CharacterPositionDTO;
import com.example.gameservice.request.MovementRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import com.example.gameservice.infrastructure.CollisionMapLoader;

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


    public CharacterPosition getCharacterPosition(String characterId) {
        return positions.get(characterId);
    }

    public CharacterPosition moveCharacter(MovementRequest request) {
        int tileX = request.getX() / 32;
        int tileY = request.getY() / 32;

        if (blocked[tileY][tileX]) {
            return positions.get(request.getCharacterId()); // blockiert
        }
        CharacterPosition pos = positions.computeIfAbsent(
                request.getCharacterId(),
                id -> {
                    if (request.getSkin() == null || request.getSkin().isEmpty()) {
                        return null;
                    }
                    CharacterPosition cp = new CharacterPosition(id, request.getX(), request.getY());
                    cp.setSkin(request.getSkin());
                    return cp;
                }
        );

        if (pos == null) {
            return null;
        }
        pos.setX(request.getX());
        pos.setY(request.getY());
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

