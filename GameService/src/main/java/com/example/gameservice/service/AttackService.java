package com.example.gameservice.service;

import com.example.gameservice.domain.CharacterPosition;
import com.example.gameservice.dto.AttackEventDTO;
import com.example.gameservice.dto.HealthUpdateDTO;
import com.example.gameservice.request.AttackRequest;
import com.example.gameservice.request.HitRequest;
import com.example.gameservice.session.GameSession;
import com.example.gameservice.session.SessionPlayer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import java.time.Instant;

@Service
public class AttackService {

    private final SimpMessagingTemplate messagingTemplate;
    private final MovementService movementService; // ← MovementService wird hier genutzt!

    @Autowired
    private GameSessionService gameSessionService;

    @Value("${attack.cooldown.millis}")
    private long cooldownMillis;

    public AttackService(SimpMessagingTemplate messagingTemplate, MovementService movementService) {
        this.messagingTemplate = messagingTemplate;
        this.movementService = movementService;
    }

    @Async
    public void processAttack(AttackRequest request) {
        // ❗ aktuelle Position vom Spieler aus dem MovementService holen!
        CharacterPosition character = movementService.getCharacterPosition(request.getSessionId(), request.getPlayerId());
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
            executeAttack(character.getPlayerId(), request);
        } else {
            // Neuer Block: ❗ Cooldown Nachricht senden
            messagingTemplate.convertAndSendToUser(
                    character.getPlayerId(), // Benutzer ID
                    "/queue/cooldown",          // Persönlicher Channel
                    "COOLDOWN_ACTIVE"
            );
        }
    }


    private void executeAttack(String playerId, AttackRequest request) {
        double dirX = request.getDirX();
        double dirY = request.getDirY();
        double distance = Math.sqrt(dirX * dirX + dirY * dirY);
        if (distance == 0) distance = 1;

        double normX = dirX / distance;
        double normY = dirY / distance;

        AttackEventDTO event = new AttackEventDTO(
                playerId, // statt shooter.getPlayerId()
                request.getPlayerX(),
                request.getPlayerY(),
                normX,
                normY
        );

        messagingTemplate.convertAndSend("/topic/attacks", event);
    }


    public void processHit(HitRequest request) {
        boolean isZoneDamage = "ZONE".equals(request.getShooterId());

        GameSession session = gameSessionService.getSession(request.getSessionId());
        if (session == null) return;

        SessionPlayer targetPlayer = session.getByPlayerId(request.getTargetId());
        if (targetPlayer == null) return;

        int damage = request.getDamage();

        if (!isZoneDamage) {
            SessionPlayer shooterPlayer = session.getByPlayerId(request.getShooterId());
            if (shooterPlayer != null) {
                damage = shooterPlayer.getBaseAttack();
            } else {
                System.err.println("[Attack] SessionPlayer nicht gefunden für ID: " + request.getShooterId());
            }
        }

        int oldHealth = session.getCurrentHealth(targetPlayer.getPlayerId());
        int newHealth = Math.max(0, oldHealth - damage);
        session.setCurrentHealth(targetPlayer.getPlayerId(), newHealth);

        if (newHealth <= 0 && !targetPlayer.isDead()) {
            targetPlayer.setDead(true);
            System.out.println("[DEBUG] Markiere isDead = true für Spieler: " + targetPlayer.getPlayerId());

            long aliveCount = session.getSessionPlayers().stream().filter(p -> !p.isDead()).count();

            if (aliveCount == 1) {
                SessionPlayer winner = session.getSessionPlayers().stream()
                        .filter(p -> !p.isDead())
                        .findFirst()
                        .orElse(null);

                if (winner != null) {
                    messagingTemplate.convertAndSend("/topic/victory/" + winner.getPlayerId(), "YOU_WIN");
                }
            }
        }

        String source = isZoneDamage ? "ZONE" : request.getShooterId();
        System.out.println(source + " trifft " + targetPlayer.getPlayerId() + " für " + damage + " Schaden (HP: " + newHealth + ")");

        messagingTemplate.convertAndSend(
                "/topic/health",
                new HealthUpdateDTO(targetPlayer.getPlayerId(), newHealth, targetPlayer.getBaseHealth())
        );
    }
}
