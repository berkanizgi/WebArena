import Phaser from 'phaser';
export function setupMap(scene: Phaser.Scene) {
    const map = scene.make.tilemap({ key: 'map' });

    const tilesets: Phaser.Tilemaps.Tileset[] = [];

    map.tilesets.forEach(ts => {
        const tileset = map.addTilesetImage(ts.name, ts.name);
        if (tileset) tilesets.push(tileset);
    });

    // Korrekte Layer laden
    map.layers.forEach(layerData => {
        const layer = map.createLayer(layerData.name, tilesets, 0, 0);
        if (!layer) {
            console.warn(`Layer '${layerData.name}' konnte nicht erstellt werden.`);
        }
    });


    // Kamera setzen
    scene.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // Spawns laden
    const objectLayer = map.getObjectLayer('Spawns');

    if (!objectLayer) {
        console.warn("Object Layer 'Spawns' nicht gefunden.");
        return { map, spawnX: 100, spawnY: 100 }; // Fallback-Koordinaten
    }

    const spawnPoints = objectLayer.objects.filter(obj => obj.name === 'PlayerSpawn');
    const spawnPoint = Phaser.Utils.Array.GetRandom(spawnPoints);
    const spawnX = spawnPoint?.x ?? 100;
    const spawnY = spawnPoint?.y ?? 100;


    return { map, spawnX, spawnY };
}
