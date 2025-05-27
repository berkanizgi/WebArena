package com.example.gameservice.infrastructure;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;

import java.io.IOException;
import java.io.InputStream;

public class CollisionMapLoader {

    private static final ObjectMapper mapper = new ObjectMapper();
    private static final String MAP_PATH = "map/WebArenaMap.json";

    public boolean[][] loadCollisionMap() {
        try (InputStream is = getClass().getClassLoader().getResourceAsStream("map/WebArenaMap.json")) {
            JsonNode root = mapper.readTree(is);

            for (JsonNode layer : root.get("layers")) {
                if ("Collision".equals(layer.get("name").asText())) {
                    int width = layer.get("width").asInt();
                    int height = layer.get("height").asInt();
                    boolean[][] blocked = new boolean[height][width];

                    ArrayNode data = (ArrayNode) layer.get("data");
                    for (int i = 0; i < data.size(); i++) {
                        int tile = data.get(i).asInt();
                        int x = i % width;
                        int y = i / width;
                        blocked[y][x] = tile != 0;  // Nicht 0 = Kollision
                    }
                    return blocked;
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        throw new IllegalStateException("Collision layer not found or map could not be loaded.");
    }
}
