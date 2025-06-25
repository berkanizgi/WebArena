package com.example.gameservice.controller;

import com.example.gameservice.request.AttackRequest;
import com.example.gameservice.request.HealRequest;
import com.example.gameservice.request.HitRequest;
import com.example.gameservice.service.AttackService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
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


    @MessageMapping("/hit")
    public void handleHit(HitRequest request) {
        attackService.processHit(request);
    }



    @PostMapping("/api/attack/heal")
    public void heal(@RequestBody HealRequest request) {
        attackService.processHeal(request);
    }



}
