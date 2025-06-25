import GameScene from '@/phaser/GameScene';

export async function setupHealthBoxes(scene: GameScene) {
    const res = await fetch('http://localhost:8080/api/items/healthboxes');
    const items = await res.json();

    items.forEach((item: { x: number; y: number }) => {
        const box = scene.physics.add.sprite(item.x, item.y, 'health_box');
        box.setOrigin(0.5, 0.5);
        box.setDisplaySize(16, 16);

        scene.physics.add.overlap(scene.player, box, () => {
            if (!box.active) return;
            box.destroy();

            const healAmount = 200;
            scene.currentHealth = Math.min(scene.currentHealth + healAmount, scene.baseHealth);

            // Backend benachrichtigen
            fetch('http://localhost:8081/api/attack/heal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: scene.sessionId,
                    playerId: scene.playerId,
                    amount: healAmount
                })
            });

        }, undefined, scene);
    });
}
