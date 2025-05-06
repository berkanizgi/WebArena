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

        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(2);

        this.projectiles = this.add.group();
        this.cooldownBar = this.add.graphics();
        this.cooldownBar.setDepth(10);

        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
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
        const speed = 40;
        this.player.setVelocity(0);

        let moveX = 0;
        let moveY = 0;

        if (this.cursors.left.isDown) moveX -= 1;
        if (this.cursors.right.isDown) moveX += 1;
        if (this.cursors.up.isDown) moveY -= 1;
        if (this.cursors.down.isDown) moveY += 1;

        this.player.setVelocity(moveX * speed, moveY * speed);

        const dx = this.pointer.worldX - this.player.x;
        const dy = this.pointer.worldY - this.player.y;
        const angle = Phaser.Math.RadToDeg(Math.atan2(dy, dx));
        const normalized = (angle + 360) % 360;

        let aimDirection: 'down' | 'left' | 'right' | 'up';

        if (normalized >= 337.5 || normalized < 22.5) aimDirection = 'right';
        else if (normalized >= 22.5 && normalized < 67.5) aimDirection = 'right';
        else if (normalized >= 67.5 && normalized < 112.5) aimDirection = 'down';
        else if (normalized >= 112.5 && normalized < 157.5) aimDirection = 'left';
        else if (normalized >= 157.5 && normalized < 202.5) aimDirection = 'left';
        else if (normalized >= 202.5 && normalized < 247.5) aimDirection = 'left';
        else if (normalized >= 247.5 && normalized < 292.5) aimDirection = 'up';
        else aimDirection = 'right';

        const isMoving = moveX !== 0 || moveY !== 0;

        if (isMoving) {
            this.player.anims.play(aimDirection, true);
        } else {
            this.player.anims.stop();
            const idleFrames: Record<'down' | 'left' | 'right' | 'up', number> = {
                down: 0,
                left: 3,
                right: 6,
                up: 9,
            };
            this.player.setFrame(idleFrames[aimDirection]);
        }

        this.projectiles.getChildren().forEach((p: any) => {
            if (typeof p.update === 'function') {
                p.update(this.time.now, this.game.loop.delta);
            }
        });

        if (this.stompClient && this.stompClient.connected) {
            if (moveX === 0 && moveY === 0) return;
            this.stompClient.publish({
                destination: '/app/move',
                body: JSON.stringify({
                    characterId: this.characterId,
                    x: this.player.x,
                    y: this.player.y,
                    direction: aimDirection,
                    rotation: normalized
                })
            });
        }

        const now = this.time.now;
        const elapsed = now - this.lastAttackTime;
        this.cooldownProgress = Phaser.Math.Clamp(elapsed / this.cooldown, 0, 1);

        const barWidth = 30;
        const barHeight = 4;
        const barX = this.player.x - barWidth / 2;
        const barY = this.player.y - 25;

        this.cooldownBar.clear();
        this.cooldownBar.fillStyle(0x000000, 0.6);
        this.cooldownBar.fillRect(barX, barY, barWidth, barHeight);

        this.cooldownBar.fillStyle(0x00ffff, 1);
        this.cooldownBar.fillRect(barX, barY, barWidth * this.cooldownProgress, barHeight);
    }
}