package com.example.gameservice.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class PlayerOwnedCharacter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Player player;

    private Long shopItemId;  // ID des gekauften CharacterItem

    private int upgradeLevel = 1;

    private LocalDateTime purchaseDate = LocalDateTime.now();
}



