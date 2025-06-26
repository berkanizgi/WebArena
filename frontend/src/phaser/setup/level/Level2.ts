import type GameScene from '@/phaser/GameScene';
import { showPopup } from '@/components/PopUp';
import { PoisonCloud } from "@/phaser/setup/PoisonCloud";

export async function setupLevel2(scene: GameScene) {
    const instructions = [
        'Enter the toxic zone to experience damage!',
        'Find and collect all 3 medikits to restore your health',
        'You are ready to proceed! Congratulations!'
    ];

    const completed = {
        tookDamage: false,
        collectedMedikits: 0
    };

    let currentStep = 0;
    let healthBoxesSpawned = false;

    const tutorialBox = document.createElement('div');
    tutorialBox.innerText = instructions[currentStep];
    Object.assign(tutorialBox.style, {
        position: 'fixed',
        top: '90px',
        left: '40px',
        padding: '18px 24px',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        color: '#ffffff',
        fontFamily: 'Verdana, sans-serif',
        fontSize: '18px',
        borderRadius: '14px',
        fontWeight: 'bold',
        zIndex: '9999',
        textAlign: 'left',
        maxWidth: '300px',
        boxShadow: '0 0 14px rgba(255,255,255,0.3)',
    });
    document.body.appendChild(tutorialBox);

    scene.events.on('shutdown', () => {
        tutorialBox.remove();
    });

    const nextStep = () => {
        currentStep++;
        if (currentStep < instructions.length) {
            tutorialBox.innerText = instructions[currentStep];
        }

        if (currentStep === 2) {
            setTimeout(() => {
                showPopup(scene, '🎉 Level 2 completed!\nWell done!', () => {
                    window.location.href = '/lobby';
                });
            }, 2000);
        }
    };

    const poisonClouds: PoisonCloud[] = await fetch(`http://localhost:8080/api/map/poisonclouds?gameMode=LEVEL_2`)
        .then(res => res.json());

    const poisonSprites = poisonClouds.map(cloud => {
        const sprite = scene.add.image(cloud.x, cloud.y, 'giftwolke');
        sprite.setOrigin(0.5, 0.5);
        sprite.setDepth(5);
        sprite.setScale(0.2);
        return cloud;
    });

    scene.events.on('update', () => {
        const player = scene.player;
        if (!player) return;

        for (const cloud of poisonSprites) {
            const dx = player.x - cloud.x;
            const dy = player.y - cloud.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 32 && scene.time.now - scene.lastZoneDamageTime > 1000) {
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

                if (!completed.tookDamage) {
                    completed.tookDamage = true;
                    nextStep();

                    // 🩹 Jetzt Medikits spawnen lassen
                    if (!healthBoxesSpawned) {
                        healthBoxesSpawned = true;
                        import('@/phaser/setup/setupHealthBoxes').then(mod => {
                            mod.setupHealthBoxes(scene);
                        });
                    }
                }

                break;
            }
        }

        if (completed.tookDamage && completed.collectedMedikits >= 3 && currentStep === 1) {
            nextStep();
        }
    });

    // 🩹 Heilung durch Medikit POST erfassen
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
        const [url, config] = args;
        const requestUrl = typeof url === 'string' ? url : url.toString();
        if (requestUrl.includes('/api/attack/heal') && config?.method === 'POST') {
            completed.collectedMedikits++;
        }

        return originalFetch(...args);
    };
}
