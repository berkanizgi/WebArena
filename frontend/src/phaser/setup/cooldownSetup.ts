import type Phaser from 'phaser';

export function createCooldownBar(scene: Phaser.Scene): Phaser.GameObjects.Graphics {
    const bar = scene.add.graphics();
    bar.setDepth(10);
    return bar;
}

export function updateCooldownBar(
    bar: Phaser.GameObjects.Graphics,
    player: Phaser.GameObjects.Sprite,
    progress: number
) {
    const barWidth = 30;
    const barHeight = 4;
    const barX = player.x - barWidth / 2;
    const barY = player.y - 25;

    bar.clear();
    bar.fillStyle(0x000000, 0.6);
    bar.fillRect(barX, barY, barWidth, barHeight);

    bar.fillStyle(0x00ffff, 1);
    bar.fillRect(barX, barY, barWidth * progress, barHeight);
}
