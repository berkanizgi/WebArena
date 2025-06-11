export function createHealthBar(
    scene: Phaser.Scene
): { bar: Phaser.GameObjects.Graphics; text: Phaser.GameObjects.Text } {
    const bar = scene.add.graphics();
    bar.setDepth(10);

    const text = scene.add.text(0, 0, '', {
        fontSize: '7px',
        color: '#ffffff',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 2,
    });
    text.setDepth(11);
    text.setOrigin(0.5);

    return { bar, text };
}

export function updateHealthBar(
    bar: Phaser.GameObjects.Graphics,
    text: Phaser.GameObjects.Text,
    player: Phaser.GameObjects.Sprite,
    currentHealth: number,
    maxHealth: number
) {
    const barWidth = 40;
    const barHeight = 6;
    const barX = player.x - barWidth / 2;
    const barY = player.y - 35;

    const healthPercent = Phaser.Math.Clamp(currentHealth / maxHealth, 0, 1);

    bar.clear();
    bar.fillStyle(0x222222, 0.8); // Hintergrund
    bar.fillRect(barX, barY, barWidth, barHeight);

    const color = healthPercent > 0.5 ? 0x00ff00 : healthPercent > 0.2 ? 0xffa500 : 0xff0000;
    bar.fillStyle(color, 1);
    bar.fillRect(barX, barY, barWidth * healthPercent, barHeight);

    text.setText(`${Math.round(currentHealth)} HP`);
    text.setPosition(player.x, barY + barHeight / 2);
}
