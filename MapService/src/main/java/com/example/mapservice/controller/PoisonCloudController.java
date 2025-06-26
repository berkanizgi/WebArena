package com.example.mapservice.controller;

import com.example.mapservice.domain.PoisonCloud;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/map")
public class PoisonCloudController {

    @GetMapping("/poisonclouds")
    public List<PoisonCloud> getPoisonClouds(@RequestParam String gameMode) {
        if (gameMode.equals("LEVEL_2")) {
            return List.of(
                    new PoisonCloud(321, 475)
            );
        }
        if (gameMode.equals("MULTIPLAYER")) {
            return List.of(
                    new PoisonCloud(500, 300),
                    new PoisonCloud(800, 450)
            );
        }
        return List.of();
    }

}
