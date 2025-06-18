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
import { createHealthBar, updateHealthBar } from '@/phaser/setup/healthBarSetup';
import { setupLevel1Tutorial} from "@/phaser/setup/level/Level1";
import { setupMultiplayerZone } from '@/phaser/setup/setupMultiplayerZone';
import {SessionPlayerDTO} from "@/phaser/types";
import { useRouter } from 'next/navigation';



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
    collisionLayer!: Phaser.Tilemaps.TilemapLayer;
    private topLayer!: Phaser.Tilemaps.TilemapLayer;
    public baseAttack!: number;
    public baseHealth!: number;
    public speed!: number;
    public characterId!: string;
    public sessionId!: string;
    public currentHealth!: number;
    public healthBar!: Phaser.GameObjects.Graphics;
    public healthBarGraphics!: Phaser.GameObjects.Graphics;
    public healthBarText!: Phaser.GameObjects.Text;
    private displayedHealth!: number;
    public otherPlayerHealth = new Map<string, {
        currentHealth: number;
        baseHealth: number;
        bar: Phaser.GameObjects.Graphics;
        text: Phaser.GameObjects.Text;
        displayedHealth: number;
    }>();
    public gameMode!: string;
    public sessionPlayerMap!: Map<string, SessionPlayerDTO>;
    public zoneTimerText!: Phaser.GameObjects.Text;
    public router: any;





    constructor(config: Phaser.Types.Scenes.SettingsConfig & {
        skin: string;
        playerId: string;
        baseAttack: number;
        baseHealth: number;
        speed: number;
        characterId: string;
        sessionId: string;
        gameMode: string;
        router: any; // oder: ReturnType<typeof useRouter>
    }) {
        super(config);
        this.skin = config.skin;
        this.characterId = config.characterId;
        this.playerId = config.playerId;
        this.baseAttack = config.baseAttack;
        this.baseHealth = config.baseHealth;
        this.speed = config.speed;
        this.sessionId = config.sessionId;
        this.gameMode = config.gameMode;
        this.router = config.router; // 👈 Neu speichern

    }

    preload() {
        this.load.tilemapTiledJSON('map', '/map/WebArenaMap.json');


        const tilesets = [
            'Set 1.0', 'Set 1.1', 'Set 1.2', 'Set 1.3',
            'Set 1.5', 'Set 1.6', 'Set 1.7 pillars',
            'Set 3.1', 'Set 3.3', 'Set 4.01', 'Set 4.04', 'Set 4.4', 'Set 4.5'
        ];

        tilesets.forEach((set) => this.load.image(set, `/map/Tiles/${set}.png`));
        this.load.image('big_waterfall', '/map/Tiles/Waterfalls/Big waterfall sheet.png');

        this.load.spritesheet('green_asha', '/map/Tiles/character/green/green_asha_walk.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('black_asha', '/map/Tiles/character/black/black_asha_walk.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('red_asha', '/map/Tiles/character/red/red_asha_walk.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('blue_asha', '/map/Tiles/character/blue/blue_asha_walk.png', { frameWidth: 32, frameHeight: 32 });
    }

    create() {


        this.pointer = this.input.activePointer;

        const { map, spawnPoints, collisionLayer, topLayer } = setupMap(this);
        const index = Array.from(this.sessionPlayerMap.keys()).indexOf(this.playerId);
        const spawn = spawnPoints[index % spawnPoints.length];
        const { player, cursors } = setupPlayer(this, spawn.x, spawn.y, this.skin);
        this.collisionLayer = collisionLayer;
        this.topLayer = topLayer;

        this.player = player;
        this.cursors = cursors;

        this.physics.add.collider(this.player, this.collisionLayer);

        setupAnimations(this, this.skin);
        setupCamera(this, this.player);

        const { bar, text } = createHealthBar(this);
        this.healthBarGraphics = bar;
        this.healthBarText = text;
        this.add.existing(bar);
        this.add.existing(text);
        this.currentHealth = this.baseHealth;
        this.displayedHealth = this.baseHealth;

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
                sessionId: this.sessionId,
                playerId: this.playerId,
                playerX: this.player.x,
                playerY: this.player.y,
                dirX: normX,
                dirY: normY
            });
        });


        setupWebSocket(this);
        if (this.gameMode === 'MULTIPLAYER') {
            console.log("[GameScene] MULTIPLAYER aktiv – Zone wird vorbereitet.");
            setupMultiplayerZone(this);
        }
        if (this.gameMode === 'LEVEL_1') {
            setupLevel1Tutorial(this, this.router);
        } else if (this.gameMode === 'LEVEL_2') {
            console.log("[GameScene] LEVEL_2 aktiv – Giftzonen werden aktiviert.");
        } else if (this.gameMode === 'LEVEL_3') {
            console.log("[GameScene] LEVEL_3 aktiv – Giftwolke und NPC werden aktiviert.");
        }
    }

    update() {
        const { aimDirection, moveX, moveY, rotation } = handlePlayerMovement(this.player, this.cursors, this.pointer, this.speed);

        this.player.setDepth(Math.min(this.player.y, 99));

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
            this.characterId,
            this.sessionId
        );

        const now = this.time.now;
        const elapsed = now - this.lastAttackTime;
        this.cooldownProgress = Phaser.Math.Clamp(elapsed / this.cooldown, 0, 1);
        updateCooldownBar(this.cooldownBar, this.player, this.cooldownProgress);

        const smoothing = 0.1;
        this.displayedHealth += (this.currentHealth - this.displayedHealth) * smoothing;
        updateHealthBar(this.healthBarGraphics, this.healthBarText, this.player, this.displayedHealth, this.baseHealth);

        this.otherPlayerHealth.forEach((healthData, playerId) => {
            const entry = this.otherPlayers.get(playerId);
            if (!entry) return;
            healthData.displayedHealth += (healthData.currentHealth - healthData.displayedHealth) * 0.1;

            updateHealthBar(
                healthData.bar,
                healthData.text,
                entry.sprite,
                healthData.displayedHealth,
                healthData.baseHealth
            );
        });
    }
}
