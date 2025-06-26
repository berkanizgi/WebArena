package com.example.gameservice.client;

import com.example.gameservice.request.RewardCoinsRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class WalletApiClient {
    private final RestTemplate restTemplate = new RestTemplate();
    private final String characterServiceUrl = "http://localhost:8084/api/wallet";

    public void rewardCoins(String playerId, String characterId, int amount) {
        RewardCoinsRequest request = new RewardCoinsRequest(playerId, characterId, amount);
        restTemplate.postForEntity(characterServiceUrl + "/reward", request, Void.class);
    }
}
