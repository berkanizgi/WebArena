package com.example.mapservice.service;


import com.example.mapservice.domain.ZonePhase;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ZoneService {

    public List<ZonePhase> getZonePhasesForMap(String mapId) {
        // 🔁 Später könnte man mapId verwenden
        return List.of(
                new ZonePhase(true, 30, 30, 0.8),
                new ZonePhase(false, 60, 30, 0),
                new ZonePhase(true, 30, 50, 1.2),
                new ZonePhase(false, 45, 50, 0),
                new ZonePhase(true, 30, 70, 1.5)
        );
    }
}
