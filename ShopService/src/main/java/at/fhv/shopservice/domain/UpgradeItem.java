package at.fhv.shopservice.domain;

import jakarta.persistence.Entity;

@Entity
public class UpgradeItem extends ShopItem {

    private String bonusType; // z.B. "damage", "speed", "coins"
    private int bonusValue;   // Wert, um wieviel sich der Bonus erhöht

    public String getBonusType() {
        return bonusType;
    }

    public void setBonusType(String bonusType) {
        this.bonusType = bonusType;
    }

    public int getBonusValue() {
        return bonusValue;
    }

    public void setBonusValue(int bonusValue) {
        this.bonusValue = bonusValue;
    }
}

