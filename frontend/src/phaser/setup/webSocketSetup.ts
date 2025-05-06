import type GameScene from '../GameScene'; // ← das ist deine eigene Klasse
import type { IMessage } from '@stomp/stompjs';
import type { CharacterPositionDTO, AttackEventDTO } from '../types';
import Projectile from '@/phaser/Projectile';

export function setupWebSocket(scene: GameScene) {
    scene.stompClient.onConnect = () => {
        scene.stompClient.subscribe('/topic/movement', (message: IMessage) => {
            const data: CharacterPositionDTO = JSON.parse(message.body);
            if (data.characterId === scene.characterId) return;

            const existingEntry = scene.otherPlayers.get(data.characterId);
            if (existingEntry) {
                const sprite = existingEntry.sprite;
                const isMoving = data.x !== existingEntry.lastX || data.y !== existingEntry.lastY;
                sprite.setPosition(data.x, data.y);

                if (isMoving) {
                    sprite.anims.play(data.direction, true);
                } else {
                    sprite.anims.stop();
                    const idleFrames = { down: 0, left: 3, right: 6, up: 9 };
                    sprite.setFrame(idleFrames[data.direction]);
                }

                existingEntry.lastX = data.x;
                existingEntry.lastY = data.y;
                existingEntry.lastDirection = data.direction;
            } else {
                const newSprite = scene.physics.add.sprite(data.x, data.y, 'soldier');
                newSprite.anims.play(data.direction, true);
                scene.otherPlayers.set(data.characterId, {
                    sprite: newSprite,
                    lastX: data.x,
                    lastY: data.y,
                    lastDirection: data.direction
                });
            }
        });

        scene.stompClient.subscribe('/topic/attacks', (message: IMessage) => {
            const data: AttackEventDTO = JSON.parse(message.body);
            const projectile = new Projectile(
                scene,
                data.playerX,
                data.playerY,
                data.playerX + data.dirX * 50,
                data.playerY + data.dirY * 50
            );
            scene.projectiles.add(projectile);
        });

        fetch('http://localhost:8081/api/positions')
            .then(res => res.json())
            .then((players: CharacterPositionDTO[]) => {
                players.forEach(p => {
                    if (p.characterId === scene.characterId) return;
                    const other = scene.physics.add.sprite(p.x, p.y, 'soldier');
                    const direction = p.direction ?? 'down';
                    other.anims.play(direction, true);
                    scene.otherPlayers.set(p.characterId, {
                        sprite: other,
                        lastX: p.x,
                        lastY: p.y,
                        lastDirection: p.direction
                    });
                });
            });
    };

    scene.stompClient.activate();
}
