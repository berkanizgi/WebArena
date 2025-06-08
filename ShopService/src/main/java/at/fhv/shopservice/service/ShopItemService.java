package at.fhv.shopservice.service;

import at.fhv.shopservice.domain.CharacterItem;
import at.fhv.shopservice.domain.ShopItem;
import at.fhv.shopservice.dto.CharacterItemDTO;
import at.fhv.shopservice.domain.UpgradeItem;
import at.fhv.shopservice.dto.UpgradeItemDTO;
import at.fhv.shopservice.repository.ShopItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ShopItemService {

    private final ShopItemRepository shopItemRepository;

    public ShopItemService(ShopItemRepository shopItemRepository) {
        this.shopItemRepository = shopItemRepository;
    }

    public List<Object> getAllShopItems() {
        List<ShopItem> shopItems = shopItemRepository.findAll();
        return shopItems.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<Object> getShopItemsByCategory(String category) {
        return shopItemRepository.findAll().stream()
                .filter(item -> item.getCategory().equalsIgnoreCase(category))
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private Object toDTO(ShopItem shopItem) {
        if (shopItem instanceof CharacterItem characterItem) {
            return new CharacterItemDTO(
                    characterItem.getId(),
                    characterItem.getName(),
                    characterItem.getPriceCoins(),
                    characterItem.getPriceShards(),
                    characterItem.getCategory(),
                    characterItem.getBaseHp(),
                    characterItem.getBaseAttack(),
                    characterItem.getBaseSpeed()
            );
        } else if (shopItem instanceof UpgradeItem upgradeItem) {
            return new UpgradeItemDTO(
                    upgradeItem.getId(),
                    upgradeItem.getName(),
                    upgradeItem.getPriceCoins(),
                    upgradeItem.getPriceShards(),
                    upgradeItem.getCategory(),
                    upgradeItem.getBonusType(),
                    upgradeItem.getBonusValue()
            );
        } else {
            throw new IllegalArgumentException("Unsupported ShopItem type: " + shopItem.getClass());
        }
    }
}

