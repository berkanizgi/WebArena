package com.example.mapservice.dto;

public class ZoneInitRequestDTO {
    private String mapName;

    public ZoneInitRequestDTO() {}
    public ZoneInitRequestDTO(String mapName) {
        this.mapName = mapName;
    }

    public String getMapName() {
        return mapName;
    }

    public void setMapName(String mapName) {
        this.mapName = mapName;
    }
}
