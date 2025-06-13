'use client';

import Phaser from 'phaser';

export function showPopup(scene: Phaser.Scene, message: string, onConfirm: () => void) {
    const cam = scene.cameras.main;
    const centerX = cam.scrollX + cam.width / 2;
    const centerY = cam.scrollY + cam.height / 2;

    scene.physics.pause();
    const container = scene.add.container(centerX, centerY).setDepth(1000).setScale(0).setAlpha(0);

    const graphics = scene.add.graphics();
    graphics.fillStyle(0x223355, 0.95);
    graphics.fillRoundedRect(-80, -45, 160, 90, 16);
    graphics.lineStyle(2, 0xffffff);
    graphics.strokeRoundedRect(-80, -45, 160, 90, 16);

    const popupText = scene.add.text(0, -15, message, {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#ffffff',
        align: 'center',
        resolution: 2
    }).setOrigin(0.5);

    const button = scene.add.text(0, 20, 'Zurück zur Lobby', {
        fontFamily: 'Arial',
        fontSize: '12px',
        backgroundColor: '#0077cc',
        color: '#ffffff',
        padding: { x: 8, y: 4 },
        resolution: 2
    }).setOrigin(0.5).setInteractive();

    button.on('pointerdown', () => {
        container.destroy();
        onConfirm();
    });

    button.on('pointerover', () => {
        button.setStyle({ backgroundColor: '#0055aa' });
    });

    button.on('pointerout', () => {
        button.setStyle({ backgroundColor: '#0077cc' });
    });

    container.add([graphics, popupText, button]);

    scene.tweens.add({
        targets: container,
        scale: 1,
        alpha: 1,
        ease: 'Back.Out',
        duration: 400
    });
}
