import Phaser from 'phaser';
import { createStompClient } from './stompClient';
import { Client as StompClient } from '@stomp/stompjs';
import { sendAttack } from '@/phaser/attackClient';
import { setupMap } from '@/phaser/setup/mapSetup';
import { setupPlayer } from '@/phaser/setup/playerSetup';
import { setupAnimations } from '@/phaser/setup/animationSetup';
import { setupWebSocket } from '@/phaser/setup/webSocketSetup';
import { setupCamera } from '@/phaser/setup/cameraSetup';
import { createCooldownBar, updateCooldownBar } from '@/phaser/setup/cooldownSetup';
import { createProjectileGroup, updateProjectiles } from '@/phaser/setup/projectileSetup';
import { handlePlayerMovement } from '@/phaser/movement/movementHandler';
import { sendMovement } from '@/phaser/movement/movementSender';

export default class GameScene extends Phaser.Scene {
    private player!: Phaser.Physics.Arcade.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    public playerId = crypto.randomUUID(); // <--- geändert!
    public stompClient!: StompClient;
    public skin!: string;
    public otherPlayers = new Map<string, {
        sprite: Phaser.Physics.Arcade.Sprite;
        lastX: number;
        lastY: number;
        lastDirection: 'up' | 'down' | 'left' | 'right'; // ✅ Fix
    }>();
    private pointer!: Phaser.Input.Pointer;
    private lastAttackTime = 0;
    private cooldown = 1000;
    public projectiles!: Phaser.GameObjects.Group;
    private cooldownBar!: Phaser.GameObjects.Graphics;
    private cooldownProgress = 1;

    preload() {
        this.load.tilemapTiledJSON('map', 'map/WebArenaMap.json');

        // Tilesets aus WebArenaMap.json (angepasst mit exakten Namen)
        this.load.image('Set 1.0', 'map/Tiles/Set 1.0.png');
        this.load.image('Set 1.1', 'map/Tiles/Set 1.1.png');
        this.load.image('Set 1.2', 'map/Tiles/Set 1.2.png');
        this.load.image('Set 1.3', 'map/Tiles/Set 1.3.png');
        this.load.image('Set 1.5', 'map/Tiles/Set 1.5.png');
        this.load.image('Set 1.6', 'map/Tiles/Set 1.6.png');
        this.load.image('Set 1.7 pillars', 'map/Tiles/Set 1.7 pillars.png');
        this.load.image('Set 3.1', 'map/Tiles/Set 3.1.png');
        this.load.image('Set 3.3', 'map/Tiles/Set 3.3.png');
        this.load.image('Set 4.01', 'map/Tiles/Set 4.01.png');
        this.load.image('Set 4.04', 'map/Tiles/Set 4.04.png');
        this.load.image('Set 4.4', 'map/Tiles/Set 4.4.png');
        this.load.image('Set 4.5', 'map/Tiles/Set 4.5.png');

        this.load.image('big_waterfall', 'map/Tiles/Waterfalls/Big waterfall sheet.png');

        this.load.spritesheet('green_asha', 'map/Tiles/character/green/green_asha_walk.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet('black_asha', 'map/Tiles/character/black/black_asha_walk.png', {
            frameWidth: 32,
            frameHeight: 32
        });
    }

    create() {
        this.pointer = this.input.activePointer;
        this.physics.world.createDebugGraphic();

        const { map, spawnX, spawnY } = setupMap(this);
        const skin = 'black_asha';

        this.skin = skin;

        const { player, cursors } = setupPlayer(this, spawnX, spawnY, skin);

        this.player = player;
        this.cursors = cursors;

        setupAnimations(this, skin);

        setupCamera(this, this.player);

        this.projectiles = createProjectileGroup(this);
        this.cooldownBar = createCooldownBar(this);

        this.stompClient = createStompClient('http://localhost:8081/ws');

        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            const now = this.time.now;
            if (now - this.lastAttackTime < this.cooldown) return;

            this.lastAttackTime = now;

            sendAttack(this.stompClient, {
                playerId: this.playerId, // <---
                x: pointer.worldX,
                y: pointer.worldY,
                playerX: this.player.x,
                playerY: this.player.y
            });
        });

        setupWebSocket(this);
    }

    update() {
        const { aimDirection, moveX, moveY, rotation } = handlePlayerMovement(this.player, this.cursors, this.pointer);

        updateProjectiles(this.projectiles, this.time.now, this.game.loop.delta);

        sendMovement(
            this.stompClient,
            this.playerId, // <---
            this.player.x,
            this.player.y,
            aimDirection,
            rotation,
            moveX,
            moveY,
            this.skin
        );

        const now = this.time.now;
        const elapsed = now - this.lastAttackTime;
        this.cooldownProgress = Phaser.Math.Clamp(elapsed / this.cooldown, 0, 1);

        updateCooldownBar(this.cooldownBar, this.player, this.cooldownProgress);
    }
}
