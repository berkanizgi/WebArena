package com.example.gameservice.client;

import com.example.gameservice.request.ZoneInitRequestDTO;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class ZoneApiClient {

    private final RestTemplate restTemplate;

    public ZoneApiClient(RestTemplateBuilder builder) {
        this.restTemplate = builder.build();
    }

    public void startZone(String mapName) {
        String url = "http://localhost:8080/api/zones/start";
        ZoneInitRequestDTO request = new ZoneInitRequestDTO(mapName);

        try {
            System.out.println("[ZoneApiClient] Sende POST an " + url + " mit MapName=" + mapName);
            var response = restTemplate.postForEntity(url, request, String.class);
            System.out.println("[ZoneApiClient] Antwort: " + response.getStatusCode());
        } catch (Exception e) {
            System.err.println("[ZoneApiClient] Fehler beim Aufruf von /api/zones/start:");
            e.printStackTrace();
        }
    }

}
