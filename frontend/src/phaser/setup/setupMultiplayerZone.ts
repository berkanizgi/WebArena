import GameScene from '@/phaser/GameScene';
import { createZoneStompClient } from '@/phaser/zoneStompClient';

export function setupMultiplayerZone(scene: GameScene) {
    const zoneClient = createZoneStompClient(); // <- NEUER STOMP CLIENT!
    const poisonGraphics = scene.add.graphics().setDepth(0);

    const htmlTimer = document.createElement('div');
    htmlTimer.innerText = 'Zone wird geladen...';
    Object.assign(htmlTimer.style, {
        position: 'fixed',
        top: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '10px 20px',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        color: '#ffeb3b',
        fontFamily: 'Verdana, sans-serif',
        fontSize: '18px',
        borderRadius: '8px',
        fontWeight: 'bold',
        zIndex: '9999',
        textAlign: 'center',
        boxShadow: '0 0 10px rgba(255,255,255,0.2)',
    });
    document.body.appendChild(htmlTimer);

    scene.events.on('shutdown', () => {
        htmlTimer.remove();
        zoneClient.deactivate(); // sauber schließen
    });

    zoneClient.onConnect = () => {
        zoneClient.subscribe('/topic/zone', (message) => {
            const data = JSON.parse(message.body);
            console.log('[ZoneClient] Zone-Update empfangen:', data);

            const { centerX, centerY, radius, shrinking, secondsLeft, damagePerTick } = data;

            htmlTimer.innerText = shrinking
                ? 'Zone schrumpft!'
                : `Zone pausiert: ${secondsLeft}s`;

            poisonGraphics.clear();
            poisonGraphics.fillStyle(0x00ff00, 0.2);
            poisonGraphics.beginPath();
            poisonGraphics.arc(centerX, centerY, radius + 750, 0, Math.PI * 2);
            poisonGraphics.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
            poisonGraphics.closePath();
            poisonGraphics.fillPath();

            const dx = scene.player.x - centerX;
            const dy = scene.player.y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const now = scene.time.now;

            if (distance > radius && damagePerTick > 0 && now - (scene.lastZoneDamageTime || 0) > 1000) {
                scene.currentHealth = Math.max(0, scene.currentHealth - damagePerTick);
                scene.stompClient.publish({ // der ursprüngliche Client für /app/hit bleibt gleich
                    destination: '/app/hit',
                    body: JSON.stringify({
                        sessionId: scene.sessionId,
                        shooterId: 'ZONE',
                        targetId: scene.playerId,
                        damage: damagePerTick
                    }),
                });
                scene.lastZoneDamageTime = now;
            }
        });
    };

    zoneClient.activate();
}
