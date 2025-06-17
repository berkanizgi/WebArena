import GameScene from '@/phaser/GameScene';

export function setupMultiplayerZone(scene: GameScene) {
    let lastDamageTime = 0;

    const zone = {
        center: { x: 648.7, y: 468.7 },
        radius: 900,
        active: true,
        timerText: scene.add.text(20, 20, 'Zone aktiv!', {
            fontSize: '20px',
            color: '#ff0000',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 },
        }).setScrollFactor(0).setDepth(1000).setScale(0.2),
    };

    const poisonGraphics = scene.add.graphics().setDepth(0);
    const borderGraphics = scene.add.graphics().setDepth(1);

    scene.time.addEvent({
        delay: 100,
        loop: true,
        callback: () => {
            if (zone.radius > 40) {
                zone.radius -= 0.8;
            }

            // 🟢 Zeichnen
            poisonGraphics.clear();
            poisonGraphics.fillStyle(0x00ff00, 0.2);
            poisonGraphics.beginPath();
            poisonGraphics.arc(zone.center.x, zone.center.y, zone.radius + 750, 0, Math.PI * 2);
            poisonGraphics.arc(zone.center.x, zone.center.y, zone.radius, 0, Math.PI * 2, true);
            poisonGraphics.closePath();
            poisonGraphics.fillPath();

            // ☠️ Schaden prüfen
            const dx = scene.player.x - zone.center.x;
            const dy = scene.player.y - zone.center.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            const now = scene.time.now;

            if (distance > zone.radius && now - lastDamageTime > 1000) {
                scene.currentHealth -= 50;
                if (scene.currentHealth < 0) scene.currentHealth = 0;

                const hitRequest = {
                    sessionId: scene.sessionId,
                    shooterId: "ZONE",
                    targetId: scene.playerId,
                };

                scene.stompClient.publish({
                    destination: '/app/hit',
                    body: JSON.stringify(hitRequest),
                });

                lastDamageTime = now;
            }
        }
    });


}
