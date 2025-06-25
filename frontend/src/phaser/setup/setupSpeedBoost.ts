import GameScene from '@/phaser/GameScene';

export async function setupSpeedBoosts(scene: GameScene) {
    const res = await fetch('http://localhost:8080/api/items/speedboosts');
    const items = await res.json();

    items.forEach((item: { x: number; y: number }) => {
        const boost = scene.physics.add.sprite(item.x, item.y, 'speed_boost');
        boost.setOrigin(0.5, 0.5);
        boost.setDisplaySize(16, 16);

        scene.physics.add.overlap(scene.player, boost, () => {
            if (!boost.active) return;
            boost.destroy();

            const originalSpeed = scene.speed;
            scene.speed += 20;

            scene.time.delayedCall(7000, () => {
                scene.speed = originalSpeed;
            });
        }, undefined, scene);
    });
}
