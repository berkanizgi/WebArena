package com.example.gameservice.service;

import com.example.gameservice.Repository.CharacterRepository;
import com.example.gameservice.domain.CharacterPosition;
import com.example.gameservice.domain.GameCharacter;
import com.example.gameservice.dto.CharacterPositionDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;


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
                usedSkins.add(gc.getSkin()); // Merken, dass dieser Skin verwendet wird
                movementService.registerInitialCharacter(playerId, gc);
                return gc;
            }
        }
        return null;
    }

    public void releaseCharacter(String skin) {
        usedSkins.remove(skin);     }

    public boolean isInUse(String skin) {
        return usedSkins.contains(skin);
    }

    public List<GameCharacter> getAllCharacters() {
        return characterRepository.findAll();
    }

}

