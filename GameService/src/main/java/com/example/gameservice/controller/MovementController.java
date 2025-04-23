package com.example.gameservice.controller;

import com.example.gameservice.domain.CharacterPosition;
import com.example.gameservice.dto.CharacterPositionDTO;
import com.example.gameservice.dto.MovementRequest;
import com.example.gameservice.service.MovementService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/movement")
public class MovementController {

    private final MovementService movementService;

    public MovementController(MovementService movementService) {
        this.movementService = movementService;
    }

    @PostMapping
    public ResponseEntity<CharacterPositionDTO> move(@RequestBody MovementRequest request) {
        CharacterPosition updated = movementService.moveCharacter(request);
        return ResponseEntity.ok(new CharacterPositionDTO(updated));
    }


    @GetMapping("/{id}")
    public ResponseEntity<CharacterPositionDTO> getPosition(@PathVariable String id) {
        CharacterPosition pos = movementService.getCharacterPosition(id);
        return pos != null
                ? ResponseEntity.ok(new CharacterPositionDTO(pos))
                : ResponseEntity.notFound().build();
    }
}

