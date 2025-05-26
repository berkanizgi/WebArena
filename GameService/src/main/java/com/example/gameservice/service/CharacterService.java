package com.example.gameservice.service;

import com.example.gameservice.Repository.CharacterRepository;
import com.example.gameservice.domain.CharacterPosition;
import com.example.gameservice.dto.CharacterPositionDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class CharacterService {
    @Autowired
    public CharacterRepository characterRepository;

    public void CreateCharacter(CharacterPositionDTO characterDTO) {
        CharacterPosition character = new CharacterPosition();
        character.setName(characterDTO.getName());
        character.setDescription(characterDTO.getDescription());
        character.setHealth(characterDTO.getHealth());
        character.setAttack(characterDTO.getAttack());
        character.setRare(characterDTO.getRare());
        character.setRole(characterDTO.getRole());
        characterRepository.save(character);
    }

    public List<CharacterPosition> getAllCharacters() {
        return characterRepository.findAll();
    }

    private int lastIndex = -1;
    public synchronized CharacterPosition getNextCharacter() {
        List<CharacterPosition> all = new ArrayList<>();
        characterRepository.findAll().forEach(all::add);
        lastIndex = (lastIndex + 1) % all.size();
        return all.get(lastIndex);
    }
}
