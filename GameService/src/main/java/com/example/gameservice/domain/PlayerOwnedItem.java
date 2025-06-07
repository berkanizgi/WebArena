package com.example.gameservice.domain;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class PlayerOwnedItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Player player;

    private Long shopItemId;        // ID des gekauften UpgradeItem

    private LocalDateTime purchaseDate = LocalDateTime.now();
}



