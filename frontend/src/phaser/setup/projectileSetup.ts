import type Phaser from 'phaser';

export function createProjectileGroup(scene: Phaser.Scene): Phaser.GameObjects.Group {
    const group = scene.add.group();
    return group;
}

export function updateProjectiles(group: Phaser.GameObjects.Group, time: number, delta: number) {
    group.getChildren().forEach((p: any) => {
        if (typeof p.update === 'function') {
            p.update(time, delta);
        }
    });
}
