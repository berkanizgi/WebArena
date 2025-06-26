import type GameScene from '@/phaser/GameScene';
import { showPopup } from '@/components/PopUp';
import { setupLevel1Boost } from '@/phaser/setup/setupLevel1SpeedBoost';

export function setupLevel1Tutorial(scene: GameScene) {
    const instructions = [
        '➡️ Move using WASD',
        '➡️ Aim with your mouse',
        '➡️ Left-click to shoot',
        '⚡ Collect the speed boost to gain speed',
        '✅ You are ready to start!'
    ];

    const completed = {
        move: false,
        rotate: false,
        shoot: false,
        collectItem: false
    };

    let currentStep = 0;
    let allowNextStep = true;

    // Boost darf erst später aktiviert werden
    scene.registry.set('boostEnabled', false);

    const htmlTutorialBox = document.createElement('div');
    htmlTutorialBox.innerText = instructions[currentStep];
    Object.assign(htmlTutorialBox.style, {
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
    document.body.appendChild(htmlTutorialBox);

    scene.events.on('shutdown', () => {
        htmlTutorialBox.remove();
    });

    const nextStep = (delay: number = 5000) => {
        allowNextStep = false;
        currentStep++;

        if (currentStep < instructions.length) {
            setTimeout(() => {
                htmlTutorialBox.innerText = instructions[currentStep];
                allowNextStep = true;

                if (currentStep === 3) {
                    setupLevel1Boost(scene);
                    scene.registry.set('boostEnabled', true);
                }
            }, delay);
        }

        if (currentStep === 4) {
            setTimeout(() => {
                htmlTutorialBox.innerText = instructions[4];

                setTimeout(() => {
                    showPopup(scene, '🎉 Level 1 completed!\nLevel 2 is now unlocked!', () => {
                        const walletData = sessionStorage.getItem('wallet');
                        if (walletData) {
                            try {
                                const wallet = JSON.parse(walletData);
                                wallet.level2Unlocked = true;
                                sessionStorage.setItem('wallet', JSON.stringify(wallet));
                            } catch (e) {
                                console.error('Error unlocking level 2:', e);
                            }
                        }

                        const playerId = sessionStorage.getItem('playerId');
                        if (playerId) {
                            sessionStorage.setItem('playerId', playerId);
                            window.location.href = '/lobby';
                        } else {
                            window.location.href = '/login';
                        }
                    });
                }, 2000);
            }, 2000);
        }
    };

    scene.events.on('update', () => {
        if (!allowNextStep) return;

        if (!completed.move && scene.player.body instanceof Phaser.Physics.Arcade.Body) {
            const speed = Math.abs(scene.player.body.velocity.x) + Math.abs(scene.player.body.velocity.y);
            if (speed > 10) {
                completed.move = true;
                nextStep(6000);
            }
        }

        if (!completed.rotate) {
            const pointer = scene.input.activePointer;
            if (pointer.worldX !== 0 || pointer.worldY !== 0) {
                completed.rotate = true;
                nextStep(6000);
            }
        }

        if (!completed.collectItem && scene.registry.get('speedItemCollected')) {
            completed.collectItem = true;
            nextStep(500);
        }
    });

    scene.input.on('pointerdown', () => {
        if (!completed.shoot) {
            completed.shoot = true;
            nextStep(6000);
        }
    });
}
