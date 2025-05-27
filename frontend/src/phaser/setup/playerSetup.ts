import Phaser from 'phaser';

export function setupPlayer(scene: Phaser.Scene, spawnX: number, spawnY: number, skin: string) {
    const player = scene.physics.add.sprite(spawnX, spawnY, skin);
    player.setOrigin(0.5, 0.5);
    player.body.setSize(16, 16);
    const cursors = scene.input.keyboard!.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D,
    }) as Phaser.Types.Input.Keyboard.CursorKeys;

    return { player, cursors };
}
