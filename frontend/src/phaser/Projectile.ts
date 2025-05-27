import type GameScene from './GameScene';
import Phaser from 'phaser';

export default class Projectile extends Phaser.GameObjects.Ellipse {
    private speed = 180;
    private dirX: number;
    private dirY: number;
    private shooterId: string;
    private sceneRef: GameScene;
    private createdAt: number;


    constructor(scene: GameScene, x: number, y: number, dirX: number, dirY: number, shooterId: string) {
        super(scene, x, y, 10, 10, 0xff3300);
        this.createdAt = scene.time.now;


        this.sceneRef = scene;
        this.shooterId = shooterId;
        this.dirX = dirX;
        this.dirY = dirY;

        this.setStrokeStyle(2, 0xffff00);
        this.setAlpha(0.9);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        scene.tweens.add({
            targets: this,
            alpha: { from: 0.9, to: 0.4 },
            scale: { from: 1.0, to: 1.4 },
            duration: 150,
            yoyo: true,
            repeat: -1
        });
    }

    update(time: number, delta: number) {
        this.x += this.dirX * this.speed * (delta / 1000);
        this.y += this.dirY * this.speed * (delta / 1000);

        // Prüfe andere Spieler
        this.sceneRef.otherPlayers.forEach((entry, playerId) => {
            if (playerId === this.shooterId) return;

            const sprite = entry.sprite;
            const distance = Phaser.Math.Distance.Between(this.x, this.y, sprite.x, sprite.y);

            if (distance < 16) {
                if (this.sceneRef.playerId === this.shooterId) {
                    this.sceneRef.stompClient.publish({
                        destination: '/app/hit',
                        body: JSON.stringify({
                            shooterId: this.shooterId,
                            targetId: playerId
                        })
                    });
                }
                this.destroy();
            }
        });

        // Prüfe eigenen Spieler (wenn du nicht der Schütze bist)
        if (this.shooterId !== this.sceneRef.playerId) {
            const myPlayer = this.sceneRef.player;
            const distance = Phaser.Math.Distance.Between(this.x, this.y, myPlayer.x, myPlayer.y);

            if (distance < 16) {
                // Getroffen! – Kein publish nötig, der Schütze hat das bereits gesendet
                this.destroy();
            }
        }

        // Auto-destroy
        if (this.sceneRef.time.now - this.createdAt > 1000) {
            this.destroy();
        }
    }

}
