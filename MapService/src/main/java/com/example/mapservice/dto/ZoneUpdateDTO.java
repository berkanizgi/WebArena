package com.example.mapservice.dto;

public class ZoneUpdateDTO {
    private double centerX, centerY, radius;
    private boolean shrinking;
    private long secondsLeft;
    private int damagePerTick;

    public ZoneUpdateDTO(double centerX, double centerY, double radius, boolean shrinking, long secondsLeft, int damagePerTick) {
        this.centerX = centerX;
        this.centerY = centerY;
        this.radius = radius;
        this.shrinking = shrinking;
        this.secondsLeft = secondsLeft;
        this.damagePerTick = damagePerTick;
    }

    public double getCenterX() {
        return centerX;
    }

    public void setCenterX(double centerX) {
        this.centerX = centerX;
    }

    public double getCenterY() {
        return centerY;
    }

    public void setCenterY(double centerY) {
        this.centerY = centerY;
    }

    public double getRadius() {
        return radius;
    }

    public void setRadius(double radius) {
        this.radius = radius;
    }

    public boolean isShrinking() {
        return shrinking;
    }

    public void setShrinking(boolean shrinking) {
        this.shrinking = shrinking;
    }

    public long getSecondsLeft() {
        return secondsLeft;
    }

    public void setSecondsLeft(long secondsLeft) {
        this.secondsLeft = secondsLeft;
    }

    public int getDamagePerTick() {
        return damagePerTick;
    }

    public void setDamagePerTick(int damagePerTick) {
        this.damagePerTick = damagePerTick;
    }
}
