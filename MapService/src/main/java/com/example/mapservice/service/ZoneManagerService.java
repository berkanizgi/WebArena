package com.example.mapservice.service;

import com.example.mapservice.domain.ZoneConfig;
import com.example.mapservice.domain.ZonePhase;
import com.example.mapservice.dto.ZoneUpdateDTO;
import jakarta.annotation.PostConstruct;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Service
public class ZoneManagerService {
    private final SimpMessagingTemplate messagingTemplate;

    private ZoneConfig config;
    private List<ZonePhase> phases;
    private int currentPhaseIndex = 0;
    private double radius;
    private long nextPhaseTime;
    private boolean initialized = false;

    public ZoneManagerService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @PostConstruct
    public void startZoneTimer() {
        ScheduledExecutorService executor = Executors.newSingleThreadScheduledExecutor();
        executor.scheduleAtFixedRate(this::tick, 0, 100, TimeUnit.MILLISECONDS);
    }

    public void init(ZoneConfig config, List<ZonePhase> phases) {
        this.config = config;
        this.phases = phases;
        this.radius = config.getInitialRadius();
        this.currentPhaseIndex = 0;
        this.nextPhaseTime = System.currentTimeMillis() + (phases.get(0).getDurationSeconds() * 1000L);
        this.initialized = true;
    }
    @Scheduled(fixedRate = 1000)
    private void tick() {
        if (!initialized) return;
      //     System.out.println("[ZoneManager] Tick läuft – Radius: " + radius);
        long now = System.currentTimeMillis();

        ZonePhase current = phases.get(currentPhaseIndex);
        if (now >= nextPhaseTime && currentPhaseIndex + 1 < phases.size()) {
            currentPhaseIndex++;
            current = phases.get(currentPhaseIndex);
            nextPhaseTime = now + (current.getDurationSeconds() * 1000L);
        }

        if (current.isShrinking() && radius > 40) {
            radius -= current.getShrinkAmount();
        }

        long secondsLeft = Math.max(0, (nextPhaseTime - now) / 1000);

        // 🛰️ an alle Clients senden
        messagingTemplate.convertAndSend("/topic/zone", new ZoneUpdateDTO(
                config.getCenterX(),
                config.getCenterY(),
                radius,
                current.isShrinking(),
                secondsLeft,
                current.getDamagePerTick()
        ));
    }
}
