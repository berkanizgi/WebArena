import GameScene from '@/phaser/GameScene';

export async function setupMultiplayerZone(scene: GameScene) {
    let lastDamageTime = 0;
    const center = { x: 643, y: 470 };
    let radius = 900;

    let zonePhases: {
        shrinking: boolean;
        durationSeconds: number;
        damagePerTick: number;
        shrinkAmount: number;
    }[] = [];

    let currentPhaseIndex = 0;
    let currentPhase: typeof zonePhases[0];
    let nextPhaseTime = 0;

    // 🟢 Backend-Phasen laden
    try {
        const res = await fetch('http://localhost:8080/api/zones/phases');
        zonePhases = await res.json();
    } catch (err) {
        console.error('❌ Fehler beim Laden der Zone-Phasen:', err);
        return;
    }

    if (zonePhases.length === 0) {
        console.warn('⚠️ Keine Zone-Phasen erhalten.');
        return;
    }

    currentPhase = zonePhases[0];
    nextPhaseTime = scene.time.now + currentPhase.durationSeconds * 1000;

    // ✅ DOM-Timer mit schönerem Style
    const htmlTimer = document.createElement('div');
    htmlTimer.innerText = 'Zone lädt...';
    Object.assign(htmlTimer.style, {
        position: 'fixed',
        top: '170px',
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

    // 🧼 Entferne DOM bei Szenenende
    scene.events.on('shutdown', () => htmlTimer.remove());

    const poisonGraphics = scene.add.graphics().setDepth(0);

    scene.time.addEvent({
        delay: 100,
        loop: true,
        callback: () => {
            const now = scene.time.now;

            // 🔁 Phase wechseln
            if (now >= nextPhaseTime && currentPhaseIndex + 1 < zonePhases.length) {
                currentPhaseIndex++;
                currentPhase = zonePhases[currentPhaseIndex];
                nextPhaseTime = now + currentPhase.durationSeconds * 1000;
            }

            // 🕒 Timer-Anzeige
            if (currentPhase.shrinking) {
                htmlTimer.innerText = 'Zone schrumpft!';
                if (radius > 40) radius -= currentPhase.shrinkAmount;
            } else {
                const secondsLeft = Math.ceil((nextPhaseTime - now) / 1000);
                htmlTimer.innerText = `Zone pausiert: ${secondsLeft}s`;
            }

            // 🎯 Zone zeichnen
            poisonGraphics.clear();
            poisonGraphics.fillStyle(0x00ff00, 0.2);
            poisonGraphics.beginPath();
            poisonGraphics.arc(center.x, center.y, radius + 750, 0, Math.PI * 2);
            poisonGraphics.arc(center.x, center.y, radius, 0, Math.PI * 2, true);
            poisonGraphics.closePath();
            poisonGraphics.fillPath();

            // ☠️ Schaden nur außerhalb Zone
            const dx = scene.player.x - center.x;
            const dy = scene.player.y - center.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (
                distance > radius &&
                now - lastDamageTime > 1000 &&
                currentPhase.damagePerTick > 0
            ) {
                scene.currentHealth = Math.max(0, scene.currentHealth - currentPhase.damagePerTick);
                scene.stompClient.publish({
                    destination: '/app/hit',
                    body: JSON.stringify({
                        sessionId: scene.sessionId,
                        shooterId: 'ZONE',
                        targetId: scene.playerId,
                        damage: currentPhase.damagePerTick  // ✅ NEU: Schadenswert mitsenden!
                    }),
                });

                lastDamageTime = now;
            }
        },
    });
}
