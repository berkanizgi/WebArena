package at.fhv.characterservice.dto;

public record GameCharacterDTO(
        String characterId,
        String name,
        String skin,
        int baseHealth,
        int baseAttack,
        int baseSpeed,
        String role,
        String description,
        Boolean rare
) {}
