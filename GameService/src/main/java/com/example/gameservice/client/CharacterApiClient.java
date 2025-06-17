package com.example.gameservice.client;

import com.example.gameservice.domain.GameCharacter;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class CharacterApiClient {

    private final RestTemplate restTemplate = new RestTemplate();
    private final String characterServiceBaseUrl = "http://localhost:8084/api/characters"; // Port deines CharacterService

    public GameCharacter getCharacterBySkin(String skin) {
        return restTemplate.getForObject(characterServiceBaseUrl + "/by-skin?skin=" + skin, GameCharacter.class);
    }

    public GameCharacter getCharacterById(String characterId) {
        return restTemplate.getForObject(characterServiceBaseUrl + "/" + characterId, GameCharacter.class);
    }

}
