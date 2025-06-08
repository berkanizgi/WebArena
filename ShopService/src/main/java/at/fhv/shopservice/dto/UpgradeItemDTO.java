package at.fhv.shopservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record UpgradeItemDTO(
        @JsonProperty("id") Long shopItemID,
        @JsonProperty("name") String shopItemName,
        @JsonProperty("priceCoins") int shopItemPriceCoins,
        @JsonProperty("priceShards") int shopItemPriceShards,
        @JsonProperty("category") String shopItemCategory,
        @JsonProperty("bonusType") String shopItemBonusType,
        @JsonProperty("bonusValue") int shopItemBonusValue
) {}

