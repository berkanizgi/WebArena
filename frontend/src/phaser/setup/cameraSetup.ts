import type Phaser from 'phaser';

export function setupCamera(scene: Phaser.Scene, player: Phaser.GameObjects.Sprite) {
    scene.cameras.main.startFollow(player);
    scene.cameras.main.setZoom(2);
}
