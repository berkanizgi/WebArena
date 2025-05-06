package com.example.gameservice.controller;

import com.example.gameservice.request.AttackRequest;
import com.example.gameservice.service.AttackService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AttackController {

    private final AttackService attackService;

    public AttackController(AttackService attackService) {
        this.attackService = attackService;
    }

    @MessageMapping("/attack")
    public void handleAttack(AttackRequest request) {
        attackService.processAttack(request);
    }

}
