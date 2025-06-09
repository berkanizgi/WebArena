package com.example.gameservice.controller;

import com.example.gameservice.dto.PurchaseRequestDTO;
import com.example.gameservice.dto.WalletDTO;
import com.example.gameservice.service.PurchaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/purchase")
public class PurchaseController {

    private final PurchaseService purchaseService;

    @Autowired
    public PurchaseController(PurchaseService purchaseService) {
        this.purchaseService = purchaseService;
    }

    // Wallet lesen
    @GetMapping("/wallet/{playerId}")
    public WalletDTO getWallet(@PathVariable String playerId) {
        return purchaseService.getWalletByPlayerId(playerId);
    }

    // Wallet updaten (nur Coins/Xp ändern)
    @PutMapping("/wallet/{playerId}")
    public void updateWallet(@PathVariable String playerId, @RequestBody WalletDTO wallet) {
        purchaseService.updateWallet(playerId, wallet);
    }

    // Charakter kaufen
    @PostMapping("/owned-character")
    public void addOwnedCharacter(@RequestBody PurchaseRequestDTO request) {
        purchaseService.addOwnedCharacter(request.playerId(), request.characterId());
    }
}
