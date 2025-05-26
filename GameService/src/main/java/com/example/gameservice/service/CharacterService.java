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

    public void createCharacter(GameCharacter character) {
        characterRepository.save(character);
    }

    public List<GameCharacter> getAllCharacters() {
        return characterRepository.findAll();
    }

    // Optional: Methode, um NUR den nächsten Character zu geben
    private int lastIndex = -1;
    public synchronized GameCharacter getNextCharacter() {
        List<GameCharacter> all = new ArrayList<>();
        characterRepository.findAll().forEach(all::add);
        if (all.isEmpty()) return null;
        lastIndex = (lastIndex + 1) % all.size();
        return all.get(lastIndex);
    }

}
