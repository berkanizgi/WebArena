import Phaser from 'phaser';

const registeredSkins = new Set<string>();

export function setupAnimations(scene: Phaser.Scene, skin: string) {
    if (registeredSkins.has(skin)) {
        return;
    }

    scene.anims.create({
        key: `${skin}_down`,
        frames: scene.anims.generateFrameNumbers(skin, {start: 0, end: 7}),
        frameRate: 6,
        repeat: -1
    });
    scene.anims.create({
        key: `${skin}_right`,
        frames: scene.anims.generateFrameNumbers(skin, {start: 8, end: 15}),
        frameRate: 6,
        repeat: -1
    });
    scene.anims.create({
        key: `${skin}_up`,
        frames: scene.anims.generateFrameNumbers(skin, {start: 16, end: 23}),
        frameRate: 6,
        repeat: -1
    });
    scene.anims.create({
        key: `${skin}_left`,
        frames: scene.anims.generateFrameNumbers(skin, {start: 24, end: 31}),
        frameRate: 6,
        repeat: -1
    });

    registeredSkins.add(skin);
}
