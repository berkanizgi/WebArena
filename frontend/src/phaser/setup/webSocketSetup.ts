import type GameScene from '../GameScene';
import type { IMessage } from '@stomp/stompjs';
import type { CharacterPositionDTO, AttackEventDTO } from '../types';
import Projectile from '@/phaser/Projectile';
import { setupAnimations } from '@/phaser/setup/animationSetup';
import {createHealthBar, updateHealthBar} from "@/phaser/setup/healthBarSetup";

const initializedSkins = new Set<string>();

export function setupWebSocket(scene: GameScene) {
    scene.stompClient.onConnect = () => {
        scene.stompClient.subscribe(`/topic/movement/${scene.sessionId}`, (message) => {
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
            const isSelf = data.playerId === scene.playerId;

            if (isSelf) {
                scene.currentHealth = data.health;

                if (scene.currentHealth <= 0) {
                    scene.player.setTint(0x000000);
                    scene.physics.pause(); // ❄️ Bewegung stoppen
                    alert("💀 Du bist gestorben!");
                    return;
                }
                updateHealthBar(scene.healthBarGraphics, scene.healthBarText, scene.player, scene.currentHealth, scene.baseHealth);
                scene.player.setTint(0xff0000);
                scene.time.delayedCall(200, () => scene.player.clearTint());
            } else {
                const entry = scene.otherPlayers.get(data.playerId);
                const healthData = scene.otherPlayerHealth.get(data.playerId);
                if (!entry || !healthData) return;

                healthData.currentHealth = data.health;

                if (healthData.currentHealth <= 0) {
                    entry.sprite.destroy();
                    scene.otherPlayers.delete(data.playerId);
                    scene.otherPlayerHealth.delete(data.playerId);
                    console.log(`[Game] Spieler ${data.playerId} ist gestorben`);
                    checkWinCondition(scene); // ⬅ Schritt 2
                    return;
                }

                healthData.currentHealth = data.health;
                healthData.displayedHealth += (healthData.currentHealth - healthData.displayedHealth) * 0.1;
                updateHealthBar(
                    healthData.bar,
                    healthData.text,
                    entry.sprite,
                    healthData.displayedHealth,
                    healthData.baseHealth
                );

                entry.sprite.setTint(0xff0000);
                scene.time.delayedCall(200, () => entry.sprite.clearTint());
            }
        });


        if (!scene.playerId) {
            console.warn('[WebSocket] Kein playerId bei fetch -> Abbruch');
            return;
        }

        console.log('[WebSocket] Fetching initial players after connect...');

        fetch(`http://localhost:8081/api/positions?sessionId=${scene.sessionId}`)
            .then(res => res.json())
            .then((players: CharacterPositionDTO[]) => {
                players.forEach(p => {
                    if (p.playerId === scene.playerId) return;
                    if (scene.otherPlayers.has(p.playerId)) return; // 🛑 Schon vorhanden!

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

                    const { bar, text } = createHealthBar(scene);
                    scene.otherPlayerHealth.set(p.playerId, {
                        currentHealth: scene.baseHealth,
                        baseHealth: scene.baseHealth,
                        bar,
                        text,
                        displayedHealth: scene.baseHealth
                    });
                });

            });
    };
    function checkWinCondition(scene: GameScene) {
        if (scene.otherPlayers.size === 0 && scene.currentHealth > 0) {
            alert("🏆 Du hast gewonnen!");
            // Optional: zur Lobby zurückleiten oder Spiel neustarten
            window.location.href = "/lobby";
        }
    }
    function showPopup(scene: Phaser.Scene, message: string, onConfirm: () => void) {
        const popupBg = scene.add.rectangle(scene.cameras.main.centerX, scene.cameras.main.centerY, 300, 150, 0x000000, 0.8).setDepth(1000);
        const popupText = scene.add.text(scene.cameras.main.centerX, scene.cameras.main.centerY - 30, message, {
            fontSize: '18px',
            color: '#ffffff',
            align: 'center',
        }).setOrigin(0.5).setDepth(1001);

        const button = scene.add.text(scene.cameras.main.centerX, scene.cameras.main.centerY + 30, 'Zurück zur Lobby', {
            fontSize: '16px',
            backgroundColor: '#0055aa',
            color: '#ffffff',
            padding: { x: 10, y: 5 },
        }).setOrigin(0.5).setInteractive().setDepth(1001);

        button.on('pointerdown', () => {
            popupBg.destroy();
            popupText.destroy();
            button.destroy();
            onConfirm();
        });
    }



    scene.stompClient.activate();
}
