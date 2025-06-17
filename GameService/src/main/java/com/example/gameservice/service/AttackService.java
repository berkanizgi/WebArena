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
        CharacterPosition shooter = null;
        CharacterPosition target = movementService.getCharacterPosition(request.getSessionId(), request.getTargetId());

        boolean isZoneDamage = "ZONE".equals(request.getShooterId());

        if (!isZoneDamage) {
            shooter = movementService.getCharacterPosition(request.getSessionId(), request.getShooterId());
        }

        if (target == null) {
            System.out.println("Ungültiger Hit: Zielspieler nicht gefunden");
            return;
        }

        int damage = isZoneDamage ? request.getDamage() : shooter.getCharacter().getBaseAttack();
        int newHealth = Math.max(0, target.getCurrentHealth() - damage);
        target.setCurrentHealth(newHealth);

        if (newHealth <= 0) {
            System.out.println("[DEBUG] Spieler " + target.getPlayerId() + " ist tot. Suche Session & markiere isDead.");

            GameSession session = gameSessionService.getSession(request.getSessionId());
            if (session != null) {
                SessionPlayer targetPlayer = session.getByPlayerId(request.getTargetId());
                if (targetPlayer != null) {
                    targetPlayer.setDead(true);
                    System.out.println("[DEBUG] Markiere isDead = true für Spieler: " + targetPlayer.getPlayerId());

                    long aliveCount = session.getSessionPlayers().stream()
                            .filter(p -> !p.isDead())
                            .count();

                    if (aliveCount == 1) {
                        SessionPlayer winner = session.getSessionPlayers().stream()
                                .filter(p -> !p.isDead())
                                .findFirst()
                                .orElse(null);

                        if (winner != null) {
                            System.out.println("[DEBUG] SPIEL GEWONNEN von: " + winner.getPlayerId());
                            messagingTemplate.convertAndSend(
                                    "/topic/victory/" + winner.getPlayerId(),
                                    "YOU_WIN"
                            );
                        }
                    }
                } else {
                    System.out.println("[DEBUG] SessionPlayer NICHT gefunden in Session!");
                }
            } else {
                System.out.println("[DEBUG] Session NICHT gefunden mit ID: " + request.getSessionId());
            }
        }

        String source = isZoneDamage ? "ZONE" : shooter.getPlayerId();
        System.out.println(source + " trifft " + target.getPlayerId() + " für " + damage + " Schaden (HP: " + newHealth + ")");

        messagingTemplate.convertAndSend(
                "/topic/health",
                new HealthUpdateDTO(target.getPlayerId(), newHealth)
        );
    }







}
