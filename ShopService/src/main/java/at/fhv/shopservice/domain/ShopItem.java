package at.fhv.shopservice.domain;

import jakarta.persistence.*;

@Entity
public class ShopItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String characterId; // Verlinkung auf GameService Character

    private int priceCoins;
    private int priceShards;

    public String getId() {
        return characterId;
    }

    public int getPriceCoins() {
        return priceCoins;
    }

    public int getPriceShards() {
        return priceShards;
    }
}

