package at.fhv.shopservice.domain;

import jakarta.persistence.*;

@Entity
@Inheritance(strategy = InheritanceType.JOINED) // JOINED = separate Tabellen für Subklassen
public abstract class ShopItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private int priceCoins;
    private int priceShards;

    // Optional: Kategorie für einfacheres Filtern im Frontend ("character", "upgrade", etc.)
    private String category;

}

