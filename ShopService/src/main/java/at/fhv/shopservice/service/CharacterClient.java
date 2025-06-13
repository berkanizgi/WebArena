package at.fhv.shopservice.service;

import at.fhv.shopservice.dto.GameCharacterDTO;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;

@Service
public class CharacterClient {

    private final RestTemplate restTemplate;

    public CharacterClient(RestTemplateBuilder builder) {
        this.restTemplate = builder.build();
    }

    public List<GameCharacterDTO> fetchAllCharacters() {
        String url = "http://localhost:8084/api/characters"; // GameService URL
        ResponseEntity<GameCharacterDTO[]> response = restTemplate.getForEntity(url, GameCharacterDTO[].class);

        if (response.getStatusCode() == HttpStatus.OK) {
            return Arrays.asList(response.getBody());
        } else {
            throw new RuntimeException("Failed to fetch characters");
        }
    }
}

