import type GameScene from "@/phaser/GameScene";

interface PoisonCloud {
    x: number;
    y: number;
    radius: number;
}

export async function setupPoisonClouds(scene: GameScene) {
    const res = await fetch(`http://localhost:8080/api/map/poisonclouds?gameMode=${scene.gameMode}`);
    const clouds: PoisonCloud[] = await res.json();

    clouds.forEach(cloud => {
        const sprite = scene.add.image(cloud.x, cloud.y, 'giftwolke');
        sprite.setOrigin(0.5, 0.5);
        sprite.setDepth(5);
        sprite.setScale(0.2); // je nach Größe
        scene.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => {
                const player = scene.player;
                if (!player) return;

                const dx = player.x - cloud.x;
                const dy = player.y - cloud.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < cloud.radius && scene.time.now - scene.lastZoneDamageTime > 1000) {
                    scene.lastZoneDamageTime = scene.time.now;
                    scene.stompClient?.publish({
                        destination: "/app/hit",
                        body: JSON.stringify({
                            sessionId: scene.sessionId,
                            targetId: scene.playerId,
                            shooterId: "GIFTWOLKE",
                            damage: 25
                        })
                    });
                }
            }
        });
    });
}
