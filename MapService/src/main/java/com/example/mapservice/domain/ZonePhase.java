package com.example.mapservice.domain;

// src/main/java/com/example/mapservice/model/ZonePhase.java
public class ZonePhase {
    private boolean shrinking;
    private int durationSeconds;
    private int damagePerTick;
    private double shrinkAmount;

    public ZonePhase(boolean shrinking, int durationSeconds, int damagePerTick, double shrinkAmount) {
        this.shrinking = shrinking;
        this.durationSeconds = durationSeconds;
        this.damagePerTick = damagePerTick;
        this.shrinkAmount = shrinkAmount;
    }

    public boolean isShrinking() { return shrinking; }
    public int getDurationSeconds() { return durationSeconds; }
    public int getDamagePerTick() { return damagePerTick; }
    public double getShrinkAmount() { return shrinkAmount; }
}
