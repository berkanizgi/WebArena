package com.example.gameservice.service;

import com.example.gameservice.dto.AttackRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class AttackService {

    private final SimpMessagingTemplate messagingTemplate;

    public AttackService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void processAttack(AttackRequest request) {
        messagingTemplate.convertAndSend("/topic/attack", request);
    }
}
