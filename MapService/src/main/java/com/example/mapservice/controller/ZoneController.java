package com.example.mapservice.controller;
import com.example.mapservice.domain.ZonePhase;
import com.example.mapservice.service.ZoneService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/zones")
public class ZoneController {

    private final ZoneService zoneService;

    public ZoneController(ZoneService zoneService) {
        this.zoneService = zoneService;
    }

    @GetMapping("/phases")
    public List<ZonePhase> getZonePhases(@RequestParam(required = false) String mapId) {
        return zoneService.getZonePhasesForMap(mapId);
    }
}
