package at.fhv.shopservice.controller;

import at.fhv.shopservice.dto.PurchaseRequestDTO;
import at.fhv.shopservice.service.PurchaseService;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/shop")
public class ShopController {

    private final PurchaseService purchaseService;

    public ShopController(PurchaseService purchaseService) {
        this.purchaseService = purchaseService;
    }

    @PostMapping("/purchase")
    public void purchaseCharacter(@RequestBody PurchaseRequestDTO request) {
        purchaseService.purchaseCharacter(request);
    }
}
