package com.example.gameservice.controller;

import com.example.gameservice.domain.CharacterPosition;
import com.example.gameservice.dto.CharacterPositionDTO;
import com.example.gameservice.dto.MovementRequest;
import com.example.gameservice.service.MovementService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class WebSocketMovementController {

    private final MovementService movementService;
    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketMovementController(MovementService movementService, SimpMessagingTemplate messagingTemplate) {
        this.movementService = movementService;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/move")
    public void moveCharacterViaWebSocket(MovementRequest request) {
        movementService.moveAndBroadcast(request);
    }

    @MessageMapping("/rotate")
    public void rotateCharacterViaWebSocket(MovementRequest request) {
        movementService.updateRotation(request);
    }

    @GetMapping("/positions")
    public List<CharacterPositionDTO> getAllPositions() {
        List<CharacterPositionDTO> all = movementService.getAllPositions();
        return all;
    }
}
