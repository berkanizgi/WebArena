package com.example.gameservice.controller;

import com.example.gameservice.Repository.CharacterRepository;
import com.example.gameservice.domain.GameCharacter;
import com.example.gameservice.request.RegisterRequest;
import com.example.gameservice.service.CharacterService;
import com.example.gameservice.service.MovementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/characters")
public class CharacterController {

    @Autowired
    private CharacterService characterService;

    @Autowired
    private MovementService movementService;

    @Autowired
    private CharacterRepository characterRepository;

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

    @PostMapping("/register")
    public ResponseEntity<Void> registerPlayer(@RequestBody RegisterRequest request) {
        Optional<GameCharacter> optional = characterRepository.findBySkin(request.getSkin());

        if (optional.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        GameCharacter character = optional.get();
        if (characterService.isInUse(character.getSkin())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build(); // Skin schon vergeben
        }

        movementService.registerInitialCharacter(request.getPlayerId(), character);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/unregister")
    public ResponseEntity<Void> unregisterPlayer(@RequestBody RegisterRequest request) {
        characterService.releaseCharacter(request.getSkin());
        return ResponseEntity.ok().build();
    }





}
