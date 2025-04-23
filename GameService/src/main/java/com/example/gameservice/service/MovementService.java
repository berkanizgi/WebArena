package com.example.gameservice.service;

import com.example.gameservice.domain.CharacterPosition;
import com.example.gameservice.dto.MovementRequest;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class MovementService {

    private final Map<String, CharacterPosition> positions = new ConcurrentHashMap<>();

    public CharacterPosition moveCharacter(MovementRequest request) {
        CharacterPosition pos = positions.computeIfAbsent(
                request.getCharacterId(),
                id -> new CharacterPosition(id, 0, 0)
        );
        pos.move(request.getDirection());
        return pos;
    }

    public CharacterPosition getCharacterPosition(String characterId) {
        return positions.get(characterId);
    }
}
