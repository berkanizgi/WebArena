package com.example.mapservice.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Map {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private final int x = 600;
    private final int y = 400;

    public Map() {

    }

    public int getX() {
        return x;
    }

    public int getY() {
        return y;
    }

}
