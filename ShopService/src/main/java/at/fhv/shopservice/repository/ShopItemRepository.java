package at.fhv.shopservice.repository;

import at.fhv.shopservice.domain.ShopItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;


public interface ShopItemRepository extends JpaRepository<ShopItem, Long> {

    // Optional: Custom Queries, falls du mal nach Typ filtern willst

    Optional<ShopItem> findByCharacterId(String characterId);
}

