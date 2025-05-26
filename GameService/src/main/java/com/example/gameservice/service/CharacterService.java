package com.example.gameservice.service;

import com.example.gameservice.Repository.CharacterRepository;
import com.example.gameservice.domain.CharacterPosition;
import com.example.gameservice.domain.GameCharacter;
import com.example.gameservice.dto.CharacterPositionDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class CharacterService {
    @Autowired
    public CharacterRepository characterRepository;

    @Autowired
    private MovementService movementService;

    public void createCharacter(GameCharacter character) {
        characterRepository.save(character);
    }

    public List<GameCharacter> getAllCharacters() {
        return characterRepository.findAll();
    }

    public GameCharacter assignNextAvailableCharacter(String playerId) {
        List<String> usedSkins = movementService.getAllPositions()
                .stream()
                .map(p -> p.getSkin())
                .toList();

        List<GameCharacter> all = characterRepository.findAll();

        for (GameCharacter gc : all) {
            if (!usedSkins.contains(gc.getSkin())) {
                movementService.registerInitialCharacter(playerId, gc);
                return gc;
            }
        }
        return null;
    }




}
