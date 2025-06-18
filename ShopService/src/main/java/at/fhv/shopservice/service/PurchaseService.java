package at.fhv.shopservice.service;

import at.fhv.shopservice.dto.PurchaseRequestDTO;
import at.fhv.shopservice.dto.WalletDTO;
import at.fhv.shopservice.domain.ShopItem;
import at.fhv.shopservice.repository.ShopItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class PurchaseService {

    private final ShopItemRepository shopItemRepository;
    private final RestTemplate restTemplate;

    public PurchaseService(ShopItemRepository shopItemRepository, RestTemplate restTemplate) {
        this.shopItemRepository = shopItemRepository;
        this.restTemplate = restTemplate;
    }

    public void purchaseCharacter(PurchaseRequestDTO request) {
        // 1. Preis für CharacterId holen
        ShopItem item = shopItemRepository.findByCharacterId(request.characterId())
                .orElseThrow(() -> new RuntimeException("Shop item not found for character ID: " + request.characterId()));

        int priceCoins = item.getPriceCoins();

        // 2. Wallet vom Spieler holen
        String walletUrl = "http://localhost:8081/api/purchase/wallet/" + request.playerId(); // GameService
        WalletDTO wallet = restTemplate.getForObject(walletUrl, WalletDTO.class);

        if (wallet == null) {
            throw new RuntimeException("Player wallet not found");
        }

        // 3. Check ob genug Coins
        if (wallet.coins() < priceCoins) {
            throw new RuntimeException("Not enough coins");
        }

        // 4. Coins abziehen → neues Wallet bauen
        WalletDTO updatedWallet = new WalletDTO(wallet.xp(), wallet.coins() - priceCoins, wallet.selectedCharacterId());

        // 5. Wallet updaten
        restTemplate.put(walletUrl, updatedWallet);

        // 6. Owned Character hinzufügen
        String addCharacterUrl = "http://localhost:8084/api/characters/owned-character";
        restTemplate.postForEntity(addCharacterUrl, request, Void.class);
    }
}
