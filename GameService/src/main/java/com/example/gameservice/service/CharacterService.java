package com.example.gameservice.service;

import com.example.gameservice.Repository.CharacterRepository;
import com.example.gameservice.domain.CharacterPosition;
import com.example.gameservice.domain.GameCharacter;
import com.example.gameservice.dto.CharacterPositionDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;


@Service
public class CharacterService {
    @Autowired
    public CharacterRepository characterRepository;

    @Autowired
    private MovementService movementService;

    // Neue In-Memory-Liste der verwendeten Skins
    private Set<String> usedSkins = new HashSet<>();

    public GameCharacter assignNextAvailableCharacter(String playerId) {
        List<GameCharacter> all = characterRepository.findAll();

        for (GameCharacter gc : all) {
            if (!usedSkins.contains(gc.getSkin())) {
                return gc;
            }
        }
        return null;
    }

    public boolean registerCharacter(String playerId, String skin) {
        Optional<GameCharacter> optional = characterRepository.findBySkin(skin);

        if (optional.isEmpty()) {
            return false;
        }

        GameCharacter character = optional.get();
        if (isInUse(character.getSkin())) {
            return false;
        }

        markInUse(character.getSkin());
        movementService.registerInitialCharacter(playerId, character);
        return true;
    }

    public void markInUse(String skin) {
        usedSkins.add(skin);
    }



    public void releaseCharacter(String skin) {
        usedSkins.remove(skin);
    }

    public boolean isInUse(String skin) {
        return usedSkins.contains(skin);
    }

    public List<GameCharacter> getAllCharacters() {
        return characterRepository.findAll();
    }

}

