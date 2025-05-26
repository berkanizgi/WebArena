package com.example.gameservice.controller;

import com.example.gameservice.domain.GameCharacter;
import com.example.gameservice.service.CharacterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/characters")
public class CharacterController {

    @Autowired
    private CharacterService characterService;

    @GetMapping
    public List<GameCharacter> getAllCharacters() {
        return characterService.getAllCharacters();
    }

    @GetMapping("/next-available")
    public ResponseEntity<GameCharacter> getNextAvailableCharacter(@RequestParam String playerId) {
        GameCharacter character = characterService.assignNextAvailableCharacter(playerId);
        if (character == null) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        return ResponseEntity.ok(character);
    }


}
