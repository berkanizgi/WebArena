import Phaser from 'phaser';

export function setupMap(scene: Phaser.Scene) {
    const map = scene.make.tilemap({ key: 'map' });
    const tileset = map.addTilesetImage('WebArenaTiles', 'tiles');

    map.createLayer('Bottom', tileset!, 0, 0);
    map.createLayer('Top', tileset!, 0, 0);

    const spawnX = map.widthInPixels / 2;   //TBD: IN BACKEND
    const spawnY = map.heightInPixels / 2;  //TBD: IN BACKEND

    return { map, spawnX, spawnY };
}
