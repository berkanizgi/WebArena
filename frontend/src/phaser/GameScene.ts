import Phaser from 'phaser';
import { createStompClient } from './stompClient';
import type { Client, IMessage } from '@stomp/stompjs';

interface CharacterPositionDTO {
    characterId: string;
    x: number;
    y: number;
}

export default class GameScene extends Phaser.Scene {
    private player!: Phaser.Physics.Arcade.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private characterId = crypto.randomUUID();
    private stompClient!: Client;
    private otherPlayers = new Map<string, Phaser.Physics.Arcade.Sprite>();

    preload() {
        this.load.image('tiles', 'map/terrain.png');
        this.load.tilemapTiledJSON('map', 'map/WebArenaMap.json');
        this.load.spritesheet('soldier', 'assets/soldier.png', {
            frameWidth: 32,
            frameHeight: 32
        });
    }

    create() {
        const map = this.make.tilemap({ key: 'map' });
        const tileset = map.addTilesetImage('WebArenaTiles', 'tiles');
        map.createLayer('Bottom', tileset!, 0, 0);
        map.createLayer('Top', tileset!, 0, 0);

        const spawnX = map.widthInPixels / 2;
        const spawnY = map.heightInPixels / 2;

        this.player = this.physics.add.sprite(spawnX, spawnY, 'soldier');
        this.cursors = this.input.keyboard!.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
        }) as Phaser.Types.Input.Keyboard.CursorKeys;


        this.setupAnimations();
        this.setupWebSocket();

        //Kamera folgt Spieler
        this.cameras.main.startFollow(this.player);

        // Kamera-Zoom setzen
        this.cameras.main.setZoom(2); // z.B. 2-fach vergrößert
    }



    setupAnimations() {
        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers('soldier', { start: 0, end: 2 }),
            frameRate: 10,
            repeat: -1,
        });
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('soldier', { start: 3, end: 5 }),
            frameRate: 10,
            repeat: -1,
        });
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('soldier', { start: 6, end: 8 }),
            frameRate: 10,
            repeat: -1,
        });
        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers('soldier', { start: 9, end: 11 }),
            frameRate: 10,
            repeat: -1,
        });
    }

    setupWebSocket() {
        this.stompClient = createStompClient('http://localhost:8081/ws');

        this.stompClient.onConnect = () => {
            console.log(' Verbunden mit WebSocket');

            this.stompClient.subscribe('/topic/movement', (message: IMessage) => {
                const data: CharacterPositionDTO = JSON.parse(message.body);
                if (data.characterId === this.characterId) return;

                const existing = this.otherPlayers.get(data.characterId);
                if (existing) {
                    existing.setPosition(data.x, data.y);
                } else {
                    const newPlayer = this.physics.add.sprite(data.x, data.y, 'soldier');
                    newPlayer.setTint(0xffaaaa);
                    newPlayer.play('down');
                    this.otherPlayers.set(data.characterId, newPlayer);
                }
            });

            fetch('http://localhost:8081/api/positions')
                .then(res => res.json())
                .then((players: CharacterPositionDTO[]) => {
                    players.forEach(p => {
                        if (p.characterId === this.characterId) return;
                        const other = this.physics.add.sprite(p.x, p.y, 'soldier');
                        other.setTint(0xffaaaa);
                        other.play('down');
                        this.otherPlayers.set(p.characterId, other);
                    });
                });
        };

        this.stompClient.activate();
    }

    update() {
        const speed = 40;
        this.player.setVelocity(0);

        let direction: string | null = null;

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-speed);
            this.player.anims.play('left', true);
            direction = 'LEFT';
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(speed);
            this.player.anims.play('right', true);
            direction = 'RIGHT';
        }

        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-speed);
            if (!direction) this.player.anims.play('up', true);
            direction = 'UP';
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(speed);
            if (!direction) this.player.anims.play('down', true);
            direction = 'DOWN';
        }

        if (!direction) {
            this.player.anims.stop();
            return;
        }

        if (this.stompClient && this.stompClient.connected) {
            this.stompClient.publish({
                destination: '/app/move',
                body: JSON.stringify({
                    characterId: this.characterId,
                    direction: direction,
                    rotation: 0
                })
            });
        }
    }
}
