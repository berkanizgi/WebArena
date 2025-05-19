package com.example.gameservice.service;

import com.example.gameservice.Repository.CharacterRepository;
import com.example.gameservice.domain.CharacterPosition;
import com.example.gameservice.dto.CharacterPositionDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CharacterService {
    @Autowired
    public CharacterRepository characterRepository;

    public void CreateCharacter(CharacterPositionDTO characterDTO) {
        CharacterPosition character = new CharacterPosition();
        character.setName(characterDTO.getName());
        character.setDescription(characterDTO.getDescription());
        character.setBaseStats(characterDTO.getBaseStats());
        character.setRare(characterDTO.getRare());
        character.setRole(characterDTO.getRole());
        characterRepository.save(character);
    }
}
