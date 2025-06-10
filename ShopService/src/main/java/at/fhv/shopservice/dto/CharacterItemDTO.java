package at.fhv.shopservice.dto;


import com.fasterxml.jackson.annotation.JsonProperty;

public record CharacterItemDTO(
        @JsonProperty("id") Long shopItemID,
        @JsonProperty("name") String shopItemName,
        @JsonProperty("priceCoins") int shopItemPriceCoins,
        @JsonProperty("priceShards") int shopItemPriceShards,
        @JsonProperty("category") String shopItemCategory,
        @JsonProperty("baseHp") int shopItemBaseHp,
        @JsonProperty("baseAttack") int shopItemBaseAttack,
        @JsonProperty("baseSpeed") int shopItemBaseSpeed
) {}

