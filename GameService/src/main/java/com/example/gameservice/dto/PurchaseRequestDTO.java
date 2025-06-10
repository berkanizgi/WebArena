package com.example.gameservice.dto;

public record PurchaseRequestDTO(
        String playerId,
        String characterId
) {}
