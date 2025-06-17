'use client';

import type GameScene from '@/phaser/GameScene';
import { showPopup } from '@/components/PopUp';

export function checkWinCondition(scene: GameScene) {
    console.log("[Debug] checkWinCondition aufgerufen. Aktuelle HP:", scene.currentHealth);

    if (scene.currentHealth <= 0) {
        console.log("[Debug] Du bist selbst tot. Abbruch.");
        return;
    }

    let lebendeGegner = 0;

    for (const [id, healthData] of scene.otherPlayerHealth.entries()) {
        console.log(`[Debug] Gegner ${id}: ${healthData.currentHealth} HP`);
        if (healthData.currentHealth > 0) lebendeGegner++;
    }

    if (lebendeGegner === 0) {
        console.log("[Debug] Kein lebender Gegner mehr. Sieg!");
        showPopup(scene, "🏆 Du hast gewonnen!", () => {
            window.location.href = "/lobby";
        });
    }
}
