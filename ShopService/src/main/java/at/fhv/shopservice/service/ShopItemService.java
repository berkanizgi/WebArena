package at.fhv.shopservice.service;


import at.fhv.shopservice.domain.ShopItem;
import at.fhv.shopservice.dto.CharacterWithPriceDTO;
import at.fhv.shopservice.dto.GameCharacterDTO;
import at.fhv.shopservice.repository.ShopItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ShopItemService {

    @Autowired
    private ShopItemRepository shopItemRepository;

    @Autowired
    private CharacterClient characterClient;

    public ShopItemService(ShopItemRepository shopItemRepository) {
        this.shopItemRepository = shopItemRepository;
    }

    public List<Object> getShopItemsByRare(Boolean rare) {
        List<Object> allItems = Collections.singletonList(getAllShopItems());
        if (rare == null) {
            return allItems;
        }
        return allItems.stream()
                .filter(item -> {
                    if (item instanceof GameCharacterDTO character) {
                        return rare.equals(character.rare());
                    }
                    return false;
                })
                .collect(Collectors.toList());
    }


    public List<CharacterWithPriceDTO> getAllShopItems() {
        List<ShopItem> shopItems = shopItemRepository.findAll();
        List<GameCharacterDTO> characters = characterClient.fetchAllCharacters();

        return characters.stream()
                .map(character -> {
                    ShopItem priceInfo = shopItems.stream()
                            .filter(item -> item.getId().equals(character.characterId()))
                            .findFirst()
                            .orElseThrow(() -> new RuntimeException("Price not found for character " + character.characterId()));

                    return new CharacterWithPriceDTO(
                            character.characterId(),
                            character.name(),
                            character.skin(),
                            character.baseHealth(),
                            character.baseAttack(),
                            character.speed(),
                            character.role(),
                            character.description(),
                            character.rare(),
                            priceInfo.getPriceCoins(),
                            priceInfo.getPriceShards()
                    );
                })
                .collect(Collectors.toList());
    }

}

