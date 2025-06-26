package at.fhv.characterservice.controller;

import at.fhv.characterservice.domain.Wallet;
import at.fhv.characterservice.request.RewardCoinsRequest;
import at.fhv.characterservice.service.WalletService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/wallet")
public class WalletController {

    private final WalletService walletService;

    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    @PostMapping("/reward")
    public void rewardCoins(@RequestBody RewardCoinsRequest request) {
        Wallet wallet = walletService.getWallet(request.getPlayerId(), request.getCharacterId());
        wallet.setCoins(wallet.getCoins() + request.getAmount());
        walletService.save(wallet);
    }
}
