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
    public player!: Phaser.Physics.Arcade.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    public playerId!: string;
    public stompClient!: StompClient;
    public skin!: string;
    public otherPlayers = new Map<string, {
        sprite: Phaser.Physics.Arcade.Sprite;
        lastX: number;
        lastY: number;
        lastDirection: 'up' | 'down' | 'left' | 'right';
    }>();
    private pointer!: Phaser.Input.Pointer;
    public lastAttackTime = 0;
    private cooldown = 1000;
    public projectiles!: Phaser.GameObjects.Group;
    private cooldownBar!: Phaser.GameObjects.Graphics;
    private cooldownProgress = 1;
    private collisionLayer!: Phaser.Tilemaps.TilemapLayer; // NEU

    constructor(config: Phaser.Types.Scenes.SettingsConfig & { skin: string; playerId: string }) {
        super(config);
        this.skin = config.skin;
        this.playerId = config.playerId;
    }

    preload() {
        this.load.tilemapTiledJSON('map', 'map/WebArenaMap.json');

        const tilesets = [
            'Set 1.0', 'Set 1.1', 'Set 1.2', 'Set 1.3',
            'Set 1.5', 'Set 1.6', 'Set 1.7 pillars',
            'Set 3.1', 'Set 3.3', 'Set 4.01', 'Set 4.04', 'Set 4.4', 'Set 4.5'
        ];

        tilesets.forEach((set) => this.load.image(set, `map/Tiles/${set}.png`));
        this.load.image('big_waterfall', 'map/Tiles/Waterfalls/Big waterfall sheet.png');

        this.load.spritesheet('green_asha', 'map/Tiles/character/green/green_asha_walk.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('black_asha', 'map/Tiles/character/black/black_asha_walk.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('red_asha', 'map/Tiles/character/red/red_asha_walk.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('blue_asha', 'map/Tiles/character/blue/blue_asha_walk.png', { frameWidth: 32, frameHeight: 32 });
    }

    create() {
        this.pointer = this.input.activePointer;
        this.physics.world.createDebugGraphic();

        const { map, spawnX, spawnY, collisionLayer } = setupMap(this);
        this.collisionLayer = collisionLayer;

        const { player, cursors } = setupPlayer(this, spawnX, spawnY, this.skin);
        this.player = player;
        this.cursors = cursors;

        // ✳️ Collision aktivieren zwischen Spieler und Map
        this.physics.add.collider(this.player, this.collisionLayer);


        setupAnimations(this, this.skin);
        setupCamera(this, this.player);

        this.projectiles = createProjectileGroup(this);
        this.cooldownBar = createCooldownBar(this);

        this.stompClient = createStompClient('http://localhost:8081/ws');

        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            const now = this.time.now;
            if (now - this.lastAttackTime < this.cooldown) return;

            this.lastAttackTime = now;

            const dx = pointer.worldX - this.player.x;
            const dy = pointer.worldY - this.player.y;
            const distance = Math.sqrt(dx * dx + dy * dy) || 1;
            const normX = dx / distance;
            const normY = dy / distance;

            sendAttack(this.stompClient, {
                playerId: this.playerId,
                playerX: this.player.x,
                playerY: this.player.y,
                dirX: normX,
                dirY: normY
            });
        });

        setupWebSocket(this);
    }

    update() {
        const { aimDirection, moveX, moveY, rotation } = handlePlayerMovement(this.player, this.cursors, this.pointer);

        updateProjectiles(this.projectiles, this.time.now, this.game.loop.delta);

        if (!this.stompClient || !this.player || !this.skin || !this.playerId) return;

        sendMovement(
            this.stompClient,
            this.playerId,
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
