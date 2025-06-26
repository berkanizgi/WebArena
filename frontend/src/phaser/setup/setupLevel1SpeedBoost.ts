import GameScene from "@/phaser/GameScene";

export async function setupLevel1Boost(scene: GameScene) {
    const res = await fetch('http://localhost:8080/api/items/speedboosts/level1');
    const item = await res.json();

    const boost = scene.physics.add.sprite(item.x, item.y, 'speed_boost');
    boost.setOrigin(0.5, 0.5);
    boost.setDisplaySize(16, 16);

    boost.setActive(true);
    boost.setVisible(true);

    // Boost in scene speichern, falls du später was brauchst
    scene.registry.set('tutorialBoost', boost);

    scene.physics.add.overlap(scene.player, boost, () => {
        if (!scene.registry.get('boostEnabled')) return;

        if (!scene.registry.get('speedItemCollected')) {
            scene.registry.set('speedItemCollected', true);

            // 🧼 WIRKLICH deaktivieren + ausblenden
            boost.disableBody(true, true);

            if (scene.tutorialArrow) scene.tutorialArrow.destroy();

            const originalSpeed = scene.speed;
            scene.speed += 20;

            scene.time.delayedCall(7000, () => {
                scene.speed = originalSpeed;
            });
        }
    }, undefined, scene);
}
