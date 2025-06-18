import type GameScene from '@/phaser/GameScene';
import { showTutorialBox } from '@/components/showTutorialBox';
import { showPopup } from '@/components/PopUp';
import { useRouter } from 'next/navigation';


export function setupLevel1Tutorial(scene: GameScene, router: ReturnType<typeof useRouter>) {
    const completed = {
        move: false,
        rotate: false,
        shoot: false,
        collectItem: false // NEU


    };

    let tutorialBox = showTutorialBox(scene, 'Level 1 – Tutorial\n\n➡️ Bewege dich mit WASD');

    const updateInstruction = () => {
        let msg = 'Level 1 – Tutorial\n\n';
        if (!completed.move) msg += '➡️ Bewege dich mit WASD\n';
        else if (!completed.rotate) msg += '➡️ Drehe dich mit der Maus\n';
        else if (!completed.shoot) msg += '➡️ Schieß mit der linken Maustaste\n';
        else if (!completed.collectItem) msg += '⚡ Sammle den Blitz auf für einen kurzzeitigen Speed-Boost\n';
        else msg += '🎉 Level abgeschlossen! Level 2 freigeschaltet!';


        const textObj = tutorialBox.list.find(obj => obj instanceof Phaser.GameObjects.Text) as Phaser.GameObjects.Text;
        textObj.setText(msg);
    };

    updateInstruction();

    scene.events.on('update', () => {
        const cam = scene.cameras.main;
        tutorialBox.setPosition(cam.worldView.x + 14, cam.worldView.y + 14);

        if (!completed.move && scene.player.body instanceof Phaser.Physics.Arcade.Body) {
            const speed = Math.abs(scene.player.body.velocity.x) + Math.abs(scene.player.body.velocity.y);
            if (speed > 10) {
                completed.move = true;
                updateInstruction();
            }
        }
        if (!completed.collectItem && scene.registry.get('speedItemCollected')) {
            completed.collectItem = true;
            updateInstruction();
        }


        if (!completed.rotate) {
            const pointer = scene.input.activePointer;
            if (pointer.worldX !== 0 || pointer.worldY !== 0) {
                completed.rotate = true;
                updateInstruction();
            }
        }
    });

    scene.input.on('pointerdown', () => {
        if (!completed.shoot) {
            completed.shoot = true;
            updateInstruction();
        }
    });
}
export function unlockLevel2(scene: Phaser.Scene, router: ReturnType<typeof useRouter>) {
    const walletData = localStorage.getItem('wallet');
    if (!walletData) return;

    try {
        const wallet = JSON.parse(walletData);
        wallet.level2Unlocked = true;
        localStorage.setItem('wallet', JSON.stringify(wallet));

        scene.time.delayedCall(400, () => {
            showPopup(scene, '🎉 Level 1 abgeschlossen!\nLEVEL 2 freigeschaltet!', () => {
                const playerId = localStorage.getItem('playerId');
                if (playerId) {
                    localStorage.setItem('playerId', playerId);
                    router.push("/lobby");
                } else {
                    router.push("/login");
                }
            });
        });

    } catch (e) {
        console.error('Fehler beim Freischalten von Level 2:', e);
    }
}
