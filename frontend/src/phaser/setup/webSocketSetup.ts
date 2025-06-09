import type GameScene from '../GameScene';
import type { IMessage } from '@stomp/stompjs';
import type { CharacterPositionDTO, AttackEventDTO } from '../types';
import Projectile from '@/phaser/Projectile';
import { setupAnimations } from '@/phaser/setup/animationSetup';

const initializedSkins = new Set<string>();

export function setupWebSocket(scene: GameScene) {
    scene.stompClient.onConnect = () => {
        scene.stompClient.subscribe('/topic/movement', (message: IMessage) => {
            const data: CharacterPositionDTO = JSON.parse(message.body);
            if (!data || !data.playerId) return;
            if (data.playerId === scene.playerId) return;
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
            const existingEntry = scene.otherPlayers.get(data.playerId);

            if (existingEntry) {
                const sprite = existingEntry.sprite;
                sprite.setPosition(data.x, data.y);
                const isMoving = !!data.isMoving;

                if (isMoving && scene.anims.exists(animKey)) {
                    sprite.anims.play(animKey, true);
                } else {
                    sprite.anims.stop();
                    sprite.setFrame(idleFrames[data.direction as 'down' | 'left' | 'right' | 'up']);
                }

                existingEntry.lastX = data.x;
                existingEntry.lastY = data.y;
                existingEntry.lastDirection = data.direction;
            } else {
                const newSprite = scene.physics.add.sprite(data.x, data.y, data.skin);
                newSprite.setOrigin(0.5, 0.5);
                if (newSprite.body) newSprite.body.setSize(16, 16);
                if (scene.anims.exists(animKey)) newSprite.anims.play(animKey, true);
                scene.otherPlayers.set(data.playerId, {
                    sprite: newSprite,
                    lastX: data.x,
                    lastY: data.y,
                    lastDirection: data.direction
                });
                console.log('[WebSocket] Neuer Spieler hinzugefügt:', data.playerId);
            }
        });

        scene.stompClient.subscribe('/topic/attacks', (message: IMessage) => {
            const data: AttackEventDTO = JSON.parse(message.body);
            const projectile = new Projectile(
                scene,
                data.playerX,
                data.playerY,
                data.dirX,
                data.dirY,
                data.playerId
            );
            scene.projectiles.add(projectile);
        });

        scene.stompClient.subscribe('/topic/health', (message: IMessage) => {
            const data = JSON.parse(message.body);
            if (data.playerId === scene.playerId) {
                scene.player.setTint(0xff0000);
                scene.time.delayedCall(200, () => scene.player.clearTint());
            } else {
                const entry = scene.otherPlayers.get(data.playerId);
                if (entry) {
                    entry.sprite.setTint(0xff0000);
                    scene.time.delayedCall(200, () => entry.sprite.clearTint());
                }
            }
        });

        // ✅ fetch() OHNE Timeout, direkt bei onConnect – aber NUR wenn playerId gesetzt
        if (!scene.playerId) {
            console.warn('[WebSocket] Kein playerId bei fetch -> Abbruch');
            return;
        }

        console.log('[WebSocket] Fetching initial players after connect...');

        fetch('http://localhost:8081/api/positions')
            .then(res => res.json())
            .then((players: CharacterPositionDTO[]) => {
                players.forEach(p => {
                    if (p.playerId === scene.playerId) return;
                    if (!p.skin) {
                        console.warn('[Fetch] Fehlende skin bei Player:', p.playerId);
                        return;
                    }

                    const direction = p.direction ?? 'down';
                    const animKey = `${p.skin}_${direction}`;
                    const other = scene.physics.add.sprite(p.x, p.y, p.skin);
                    other.setOrigin(0.5, 0.5);
                    if (other.body) other.body.setSize(16, 16);

                    if (!initializedSkins.has(p.skin)) {
                        setupAnimations(scene, p.skin);
                        initializedSkins.add(p.skin);
                        console.log(`[Fetch] Animations für Skin '${p.skin}' geladen`);
                    }

                    scene.otherPlayers.set(p.playerId, {
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
