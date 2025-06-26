'use client';
import Phaser from 'phaser';

export function showPopup(scene: Phaser.Scene, message: string, onConfirm: () => void) {
    const cam = scene.cameras.main;
    const centerX = cam.scrollX + cam.width / 2;
    const centerY = cam.scrollY + cam.height / 2;

    scene.physics.pause();

    const container = scene.add.container(centerX, centerY).setDepth(1000).setScale(0).setAlpha(0);

    const boxWidth = 200;
    const boxHeight = 100;
    const graphics = scene.add.graphics();
    graphics.fillStyle(0x1a2948, 0.98);
    graphics.fillRoundedRect(-boxWidth / 2, -boxHeight / 2, boxWidth, boxHeight, 18);
    graphics.lineStyle(3, 0xffcc00);
    graphics.strokeRoundedRect(-boxWidth / 2, -boxHeight / 2, boxWidth, boxHeight, 18);

    const popupText = scene.add.text(-boxWidth / 2 + 12, -30, message, {
        fontFamily: 'Verdana',
        fontSize: '25px',
        color: '#ffeb3b',
        fontStyle: 'bold',
        align: 'left'
    }).setOrigin(0, 0).setScale(0.5);

    const button = scene.add.text(0, 30, 'Zurück zur Lobby', {
        fontFamily: 'Arial',
        fontSize: '21px',
        backgroundColor: '#0077cc',
        color: '#ffffff',
        padding: { x: 10, y: 4 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setScale(0.5);

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
