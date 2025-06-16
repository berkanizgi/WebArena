import type Phaser from 'phaser';

export function showTutorialBox(scene: Phaser.Scene, message: string): Phaser.GameObjects.Container {
    const boxWidth = 280;
    const padding = 10;

    const container = scene.add.container(0, 0)
        .setDepth(1000)
        .setAlpha(0)
        .setScale(1);

    const graphics = scene.add.graphics();
    graphics.fillStyle(0x121a2c, 0.92);
    graphics.fillRoundedRect(0, 0, boxWidth, 50, 12);
    graphics.lineStyle(2, 0x00acc1, 1);
    graphics.strokeRoundedRect(0, 0, boxWidth, 50, 12);

    const text = scene.add.text(padding, padding, message, {
        fontFamily: 'Verdana',
        fontSize: 18,
        color: '#e0f7fa',
    }).setOrigin(0).setScale(0.4);

    container.add([graphics, text]);

    scene.tweens.add({
        targets: container,
        alpha: 1,
        ease: 'Power2',
        duration: 180
    });

    scene.events.on('update', () => {
        const cam = scene.cameras.main;
        container.setPosition(cam.worldView.x + 14, cam.worldView.y + 14);
    });

    return container;
}
