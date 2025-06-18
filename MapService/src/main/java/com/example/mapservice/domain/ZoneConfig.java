package com.example.mapservice.domain;

public class ZoneConfig {
    private double centerX;
    private double centerY;
    private double initialRadius;

    public ZoneConfig(double centerX, double centerY, double initialRadius) {
        this.centerX = centerX;
        this.centerY = centerY;
        this.initialRadius = initialRadius;
    }

    public double getCenterX() {
        return centerX;
    }

    public double getCenterY() {
        return centerY;
    }

    public double getInitialRadius() {
        return initialRadius;
    }
}