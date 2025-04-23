package com.example.mapservice.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class GameMap {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private final int x = 1000;
    private final int y = 600;

    public GameMap() {

    }

    public int getX() {
        return x;
    }

    public int getY() {
        return y;
    }

}
