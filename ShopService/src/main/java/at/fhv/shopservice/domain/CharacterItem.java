package at.fhv.shopservice.domain;

import jakarta.persistence.Entity;

@Entity
public class CharacterItem extends ShopItem {

    private int baseHp;
    private int baseAttack;
    private int baseSpeed;

    public int getBaseHp() {
        return baseHp;
    }

    public void setBaseHp(int baseHp) {
        this.baseHp = baseHp;
    }

    public int getBaseAttack() {
        return baseAttack;
    }

    public void setBaseAttack(int baseAttack) {
        this.baseAttack = baseAttack;
    }

    public int getBaseSpeed() {
        return baseSpeed;
    }

    public void setBaseSpeed(int baseSpeed) {
        this.baseSpeed = baseSpeed;
    }

}

