import type GameScene from '../GameScene';
import type { IMessage } from '@stomp/stompjs';
import type { CharacterPositionDTO, AttackEventDTO } from '../types';
import Projectile from '@/phaser/Projectile';
import { setupAnimations } from '@/phaser/setup/animationSetup';

const initializedSkins = new Set<string>(); // optional: cache zum Verhindern mehrfacher setupAnimations

export function setupWebSocket(scene: GameScene) {
    scene.stompClient.onConnect = () => {
        scene.stompClient.subscribe('/topic/movement', (message: IMessage) => {
            const data: CharacterPositionDTO = JSON.parse(message.body);
            if (data.characterId === scene.characterId) return;

            if (!data.skin) {
                console.warn('[WebSocket] Fehlende skin bei Movement:', data);
                return;
            }

            if (!initializedSkins.has(data.skin)) {
                setupAnimations(scene, data.skin);
                initializedSkins.add(data.skin);
                console.log(`[WebSocket] Animations für Skin '${data.skin}' geladen`);
            }

            const animKey = `${data.skin}_${data.direction}`;
            const idleFrames = { down: 0, left: 24, right: 8, up: 16 };

            const existingEntry = scene.otherPlayers.get(data.characterId);
            if (existingEntry) {
                const sprite = existingEntry.sprite;
                const isMoving = data.x !== existingEntry.lastX || data.y !== existingEntry.lastY;
                sprite.setPosition(data.x, data.y);

                if (isMoving) {
                    if (scene.anims.exists(animKey)) {
                        sprite.anims.play(animKey, true);
                    } else {
                        console.warn('[WebSocket] Animation nicht gefunden:', animKey);
                    }
                } else {
                    sprite.anims.stop();
                    sprite.setFrame(idleFrames[data.direction]);
                }

                existingEntry.lastX = data.x;
                existingEntry.lastY = data.y;
                existingEntry.lastDirection = data.direction;
            } else {
                const newSprite = scene.physics.add.sprite(data.x, data.y, data.skin);
                if (scene.anims.exists(animKey)) {
                    newSprite.anims.play(animKey, true);
                } else {
                    console.warn('[WebSocket] Animation nicht gefunden (neuer Spieler):', animKey);
                }

                scene.otherPlayers.set(data.characterId, {
                    sprite: newSprite,
                    lastX: data.x,
                    lastY: data.y,
                    lastDirection: data.direction
                });
                console.log('[WebSocket] Neuer Spieler hinzugefügt:', data.characterId);
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
                    if (!p.skin) {
                        console.warn('[Fetch] Fehlende skin bei Player:', p.characterId);
                        return;
                    }

                    const direction = p.direction ?? 'down';
                    const animKey = `${p.skin}_${direction}`;
                    const other = scene.physics.add.sprite(p.x, p.y, p.skin);

                    if (!initializedSkins.has(p.skin)) {
                        setupAnimations(scene, p.skin);
                        initializedSkins.add(p.skin);
                        console.log(`[Fetch] Animations für Skin '${p.skin}' geladen`);
                    }

                    if (scene.anims.exists(animKey)) {
                        other.anims.play(animKey, true);
                    } else {
                        console.warn('[Fetch] Animation nicht gefunden:', animKey);
                    }

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
