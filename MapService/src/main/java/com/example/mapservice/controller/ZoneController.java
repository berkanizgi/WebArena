package com.example.mapservice.controller;
import com.example.mapservice.domain.ZoneConfig;
import com.example.mapservice.domain.ZonePhase;
import com.example.mapservice.dto.ZoneInitRequestDTO;
import com.example.mapservice.service.ZoneManagerService;
import com.example.mapservice.service.ZoneService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/zones")
public class ZoneController {

    private final ZoneService zoneService;

    private final ZoneManagerService zoneManagerService;


    public ZoneController(ZoneService zoneService, ZoneManagerService zoneManagerService) {
        this.zoneService = zoneService;
        this.zoneManagerService = zoneManagerService;


    }

    @GetMapping("/phases")
    public List<ZonePhase> getZonePhases(@RequestParam(required = false) String mapId) {
        return zoneService.getZonePhasesForMap(mapId);
    }

    @GetMapping("/config")
    public ZoneConfig getZoneConfig(@RequestParam(required = false) String mapId) {
        return zoneService.getZoneConfigForMap(mapId);
    }

    @PostMapping("/start")
    public ResponseEntity<String> startZone(@RequestBody ZoneInitRequestDTO request) {
        System.out.println("[ZoneController] POST /api/zones/start erhalten für Map: " + request.getMapName());
        ZoneConfig config = zoneService.getZoneConfigForMap(request.getMapName());
        List<ZonePhase> phases = zoneService.getZonePhasesForMap(request.getMapName());
        zoneManagerService.init(config, phases);
        return ResponseEntity.ok("Zone gestartet");
    }



}
