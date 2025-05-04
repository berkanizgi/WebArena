export default class Projectile extends Phaser.GameObjects.Ellipse {
    private speed = 300;
    private dirX: number;
    private dirY: number;

    constructor(scene: Phaser.Scene, x: number, y: number, targetX: number, targetY: number) {
        super(scene, x, y, 10, 10, 0xff3300); // kräftig rot-oranges

        // Visuelle Effekte
        this.setStrokeStyle(2, 0xffff00); // gelber Rand
        this.setAlpha(0.9);               // leicht transparent
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Bewegungsrichtung wirrd hier berechnet
        const angle = Math.atan2(targetY - y, targetX - x);
        this.dirX = Math.cos(angle);
        this.dirY = Math.sin(angle);

        // Geiler glow Effekt mit tween
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
    }
}
