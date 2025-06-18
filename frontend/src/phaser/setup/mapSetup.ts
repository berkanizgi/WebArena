import Phaser from 'phaser';

export function setupMap(scene: Phaser.Scene): {
    map: Phaser.Tilemaps.Tilemap;
    collisionLayer: Phaser.Tilemaps.TilemapLayer;
    topLayer: Phaser.Tilemaps.TilemapLayer;
    spawnPoints: { x: number, y: number }[];
} {
    const map = scene.make.tilemap({ key: 'map' });

    const tilesets: Phaser.Tilemaps.Tileset[] = [];
    map.tilesets.forEach(ts => {
        const tileset = map.addTilesetImage(ts.name, ts.name);
        if (tileset) tilesets.push(tileset);
    });

    let collisionLayer: Phaser.Tilemaps.TilemapLayer | undefined;
    let topLayer: Phaser.Tilemaps.TilemapLayer | undefined;

    map.layers.forEach(layerData => {
        const layer = map.createLayer(layerData.name, tilesets, 0, 0);
        if (!layer) {
            console.warn(`Layer '${layerData.name}' konnte nicht erstellt werden.`);
            return;
        }

        if (layerData.name === 'Collision') {
            collisionLayer = layer;
            collisionLayer.setCollisionByExclusion([-1]);
        }

        if (layerData.name === 'Top') {
            topLayer = layer;
            topLayer.setDepth(100); // über Spieler zeichnen
        }
    });

    if (!collisionLayer) throw new Error("Collision Layer wurde nicht gefunden!");
    if (!topLayer) throw new Error("TopLayer wurde nicht gefunden!");

    scene.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // Spawnpunkte aus Object Layer
    const objectLayer = map.getObjectLayer('Spawns');
    if (!objectLayer) {
        console.warn("Object Layer 'Spawns' nicht gefunden.");
        return {
            map,
            collisionLayer,
            topLayer,
            spawnPoints: [{ x: 100, y: 100 }]
        };
    }

    const spawnPoints = objectLayer.objects
        .filter(obj => obj.name === 'PlayerSpawn')
        .map(obj => ({
            x: obj.x ?? 100,
            y: obj.y ?? 100
        }));

    if (spawnPoints.length === 0) {
        console.warn("Keine 'PlayerSpawn'-Objekte gefunden.");
        spawnPoints.push({ x: 100, y: 100 });
    }

    return {
        map,
        collisionLayer,
        topLayer,
        spawnPoints
    };
}
