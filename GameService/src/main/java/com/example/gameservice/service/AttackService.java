package com.example.gameservice.service;

import com.example.gameservice.domain.CharacterPosition;
import com.example.gameservice.dto.AttackEvent;
import com.example.gameservice.dto.AttackRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

import java.time.Instant;

@Service
public class AttackService {

    @Value("${attack.cooldown.millis}")
    private long cooldownMillis;

    private final SimpMessagingTemplate messagingTemplate;

    public AttackService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void processAttack(AttackRequest request) {
        // CharacterPosition aus dem Request bauen
        CharacterPosition character = new CharacterPosition(
                request.getPlayerId(),
                request.getPlayerX(),
                request.getPlayerY()
        );

        // Cooldown prüfen & ggf. Angriff ausführen
        handleAttack(character, request);
    }

    void handleAttack(CharacterPosition character, AttackRequest request) {
        Instant now = Instant.now();
        if (now.isAfter(character.getLastShotTime().plusMillis(cooldownMillis))) {
            character.setLastShotTime(now);  // Cooldown setzen

            // Angriff ausführen
            executeAttack(character, request);
        } else {
            System.out.println("Kann nicht attackieren (Cooldown aktiv)");
        }
    }


    private void executeAttack(CharacterPosition character, AttackRequest request) {
        // Richtung berechnen (von Spieler zur Maus)
        double dirX = request.getMouseX() - character.getX();
        double dirY = request.getMouseY() - character.getY();

        // Richtung normalisieren
        double length = Math.sqrt(dirX * dirX + dirY * dirY);
        double normX = dirX / length;
        double normY = dirY / length;

        // Angriffsevent erstellen
        AttackEvent event = new AttackEvent(
                character.getCharacterId(),
                character.getX(),
                character.getY(),
                normX,
                normY
        );

        // Event broadcasten
        messagingTemplate.convertAndSend("/topic/attacks", event);
    }

}
