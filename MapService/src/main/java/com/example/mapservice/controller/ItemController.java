package com.example.mapservice.controller;

import com.example.mapservice.domain.HealthBoxItem;
import com.example.mapservice.domain.SpeedBoostItem;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/items")
public class ItemController {

    @GetMapping("/speedboosts")
    public List<SpeedBoostItem> getSpeedBoosts() {
        return List.of(
                new SpeedBoostItem(760, 99),
                new SpeedBoostItem(531.4, 99),
                new SpeedBoostItem(756.8, 855.2),
                new SpeedBoostItem(551.6, 851.6),
                new SpeedBoostItem(646, 471.6)
        );
    }

    @GetMapping("/healthboxes")
    public List<HealthBoxItem> getHealthBoxes() {
        return List.of(
                new HealthBoxItem(517.3, 475.3),
                new HealthBoxItem(778.0, 475.3),
                new HealthBoxItem(648.0, 854.5),
                new HealthBoxItem(648.0, 102.0)
        );
    }
    @GetMapping("/speedboosts/level1")
    public SpeedBoostItem getSpeedBoostForLevel1() {
        return new SpeedBoostItem(648, 472);
    }



}