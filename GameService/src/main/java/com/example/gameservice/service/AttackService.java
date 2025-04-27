package com.example.gameservice.service;

import com.example.gameservice.domain.CharacterPosition;
import com.example.gameservice.dto.AttackEvent;
import com.example.gameservice.dto.AttackRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class AttackService {

    private final SimpMessagingTemplate messagingTemplate;
    private final MovementService movementService; // ← MovementService wird hier genutzt!

    @Value("${attack.cooldown.millis}")
    private long cooldownMillis;

    public AttackService(SimpMessagingTemplate messagingTemplate, MovementService movementService) {
        this.messagingTemplate = messagingTemplate;
        this.movementService = movementService;
    }

    public void processAttack(AttackRequest request) {
        // ❗ aktuelle Position vom Spieler aus dem MovementService holen!
        CharacterPosition character = movementService.getCharacterPosition(request.getPlayerId());
        if (character == null) {
            System.out.println("Spieler nicht gefunden: " + request.getPlayerId());
            return;
        }

        handleAttack(character, request);
    }

    private void handleAttack(CharacterPosition character, AttackRequest request) {
        Instant now = Instant.now();
        if (character.canAttack(now, cooldownMillis)) {
            character.registerAttack(now); // Cooldown setzen
            executeAttack(character, request);
        } else {
            System.out.println("Cooldown aktiv für: " + character.getCharacterId());
        }
    }

    private void executeAttack(CharacterPosition character, AttackRequest request) {
        // 📏 Richtung berechnen: von Charakter-Position zur Maus
        double dirX = request.getMouseX() - character.getX();
        double dirY = request.getMouseY() - character.getY();

        double distance = Math.sqrt(dirX * dirX + dirY * dirY);

        // ❗ Zusatz-Schutz: Ist die Maus überhaupt in Reichweite? (z.B. maximal 2000 Pixel weit entfernt)
        if (distance > 2000) {
            System.out.println("Attack abgelehnt: Maus zu weit weg!");
            return; // 🛑 Angriff ignorieren
        }

        // Richtung normalisieren
        if (distance == 0) {
            distance = 1; // Schutz gegen Division durch 0
        }
        double normX = dirX / distance;
        double normY = dirY / distance;

        AttackEvent event = new AttackEvent(
                character.getCharacterId(),
                character.getX(),    // Startposition vom Charakter
                character.getY(),
                normX,
                normY
        );

        messagingTemplate.convertAndSend("/topic/attacks", event);
    }

}
