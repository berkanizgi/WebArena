package com.example.gameservice.service;

import com.example.gameservice.domain.CharacterPosition;
import com.example.gameservice.dto.CharacterPositionDTO;
import com.example.gameservice.dto.MovementRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class MovementService {

    private final Map<String, CharacterPosition> positions = new ConcurrentHashMap<>();
    private final SimpMessagingTemplate messagingTemplate;

    public MovementService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public CharacterPosition moveCharacter(MovementRequest request) {
        CharacterPosition pos = positions.computeIfAbsent(
                request.getCharacterId(),
                id -> new CharacterPosition(id, 0, 0)
        );
        pos.move(request.getDirection(), request.getRotation());
        return pos;
    }

    public CharacterPosition getCharacterPosition(String characterId) {
        return positions.get(characterId);
    }

    public void moveAndBroadcast(MovementRequest request) {
        CharacterPosition updated = moveCharacter(request);
        CharacterPositionDTO dto = new CharacterPositionDTO(updated);
        messagingTemplate.convertAndSend("/topic/movement", dto);
    }

    public List<CharacterPositionDTO> getAllPositions() {
        return positions.values().stream()
                .map(CharacterPositionDTO::new)
                .collect(Collectors.toList());
    }

}
