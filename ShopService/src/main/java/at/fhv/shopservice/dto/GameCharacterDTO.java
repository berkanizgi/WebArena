package at.fhv.shopservice.dto;

public record GameCharacterDTO(
        String characterId,
        String name,
        String skin,
        int baseHealth,
        int baseAttack,
        int speed,
        String role,
        String description,
        Boolean rare
) {}

