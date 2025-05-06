import Phaser from 'phaser';
import { createStompClient } from './stompClient';
import { Client as StompClient } from '@stomp/stompjs';
import Projectile from '@/phaser/Projectile';
import type { IMessage } from '@stomp/stompjs';
import {sendAttack} from "@/phaser/attackClient";
import type { CharacterPositionDTO, AttackEventDTO } from './types';
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
    public characterId = crypto.randomUUID();
    public stompClient!: StompClient;
    public otherPlayers = new Map<string, {
        sprite: Phaser.Physics.Arcade.Sprite;
        lastX: number;
        lastY: number;
        lastDirection: string;
    }>();
    private pointer!: Phaser.Input.Pointer;
    private lastAttackTime = 0;
    private cooldown = 1000;
    public projectiles!: Phaser.GameObjects.Group;
    private cooldownBar!: Phaser.GameObjects.Graphics;
    private cooldownProgress = 1;

    preload() {
        this.load.image('tiles', 'map/terrain.png');
        this.load.tilemapTiledJSON('map', 'map/WebArenaMap.json');
        this.load.spritesheet('soldier', 'assets/soldier.png', {  //TBD: Different Chars
            frameWidth: 32,
            frameHeight: 32
        });
    }

    create() {
        this.pointer = this.input.activePointer;

        const { map, spawnX, spawnY } = setupMap(this);  //MAP ERSTELLEN aus mapSetup.ts

        const { player, cursors } = setupPlayer(this, spawnX, spawnY); //PLAYER ERSTELLEN aus playerSetup.ts
        this.player = player;
        this.cursors = cursors;

        setupAnimations(this); //ANIMATION ERSTELLEN aus animationSetup.ts

        this.stompClient = createStompClient('http://localhost:8081/ws');
        setupWebSocket(this);

        setupCamera(this, this.player); //KAMERA KONFIGURIEREN aus cameraSetup.ts

        this.projectiles = createProjectileGroup(this);

        this.cooldownBar = createCooldownBar(this); //COOLDOWN aus cooldownSetup


        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            const now = this.time.now;
            if (now - this.lastAttackTime < this.cooldown) return;

            this.lastAttackTime = now;

            sendAttack(this.stompClient, {
                playerId: this.characterId,
                x: pointer.worldX,
                y: pointer.worldY,
                playerX: this.player.x,
                playerY: this.player.y
            });
        });

    }

    update() {
        const { aimDirection, moveX, moveY, rotation } = handlePlayerMovement(this.player, this.cursors, this.pointer);

        updateProjectiles(this.projectiles, this.time.now, this.game.loop.delta);
        sendMovement(
            this.stompClient,
            this.characterId,
            this.player.x,
            this.player.y,
            aimDirection,
            rotation,
            moveX,
            moveY
        );

        const now = this.time.now;
        const elapsed = now - this.lastAttackTime;
        this.cooldownProgress = Phaser.Math.Clamp(elapsed / this.cooldown, 0, 1);

        updateCooldownBar(this.cooldownBar, this.player, this.cooldownProgress);   //Im CooldownSetup.ts

    }
}