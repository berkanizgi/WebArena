export function handlePlayerMovement(
    player: Phaser.Physics.Arcade.Sprite,
    cursors: Phaser.Types.Input.Keyboard.CursorKeys,
    pointer: Phaser.Input.Pointer
): { aimDirection: 'down' | 'left' | 'right' | 'up'; moveX: number; moveY: number; rotation: number } {
    const speed = 100;
    player.setVelocity(0);

    let moveX = 0;
    let moveY = 0;

    if (cursors.left.isDown) moveX -= 1;
    if (cursors.right.isDown) moveX += 1;
    if (cursors.up.isDown) moveY -= 1;
    if (cursors.down.isDown) moveY += 1;

    player.setVelocity(moveX * speed, moveY * speed);

    const dx = pointer.worldX - player.x;
    const dy = pointer.worldY - player.y;
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
        player.anims.play(`${player.texture.key}_${aimDirection}`, true);
    } else {
        player.anims.stop();
        const idleFrames: Record<'down' | 'left' | 'right' | 'up', number> = {
            down: 0,
            right: 8,
            up: 16,
            left: 24,
        };
        player.setFrame(idleFrames[aimDirection]);
    }

    return { aimDirection, moveX, moveY, rotation: normalized };
}
