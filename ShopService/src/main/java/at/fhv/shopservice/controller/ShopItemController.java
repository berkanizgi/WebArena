package at.fhv.shopservice.controller;

import at.fhv.shopservice.dto.CharacterWithPriceDTO;
import at.fhv.shopservice.service.ShopItemService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000") // Frontend Adresse hier erlauben
@RestController
@RequestMapping("/api/shop")
public class ShopItemController {

    private final ShopItemService shopItemService;

    public ShopItemController(ShopItemService shopItemService) {
        this.shopItemService = shopItemService;
    }

    @GetMapping("/items")
    public List<CharacterWithPriceDTO> getAllShopItems(@RequestParam(required = false) Boolean rare){
        return shopItemService.getAllShopItems();
    }
}
