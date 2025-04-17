package com.example.mapservice.controller;


import com.example.mapservice.config.RestTemplateConfig;
import com.example.mapservice.domain.GameMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@CrossOrigin(origins = "http://localhost:3000")
@RestController("/api")
public class MapController {

    private final RestTemplate restTemplate;

    public MapController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @GetMapping("/map")
    public GameMap getMap() {
        return new GameMap();
    }

}
