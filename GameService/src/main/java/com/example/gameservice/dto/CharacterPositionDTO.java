package com.example.gameservice.dto;

import com.example.gameservice.domain.CharacterPosition;

public class CharacterPositionDTO {

    private int x;
    private int y;

    public CharacterPositionDTO(CharacterPosition position) {
        this.x = position.getX();
        this.y = position.getY();
    }
    public int getX() {
        return x;
    }

    public int getY() {
        return y;
    }

    public void setX(int x) {
        this.x = x;
    }

    public void setY(int y) {
        this.y = y;
    }
}

