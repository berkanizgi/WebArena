import type GameScene from '../GameScene';
import type { IMessage } from '@stomp/stompjs';
import type { CharacterPositionDTO, AttackEventDTO } from '../types';
import Projectile from '@/phaser/Projectile';
import { setupAnimations } from '@/phaser/setup/animationSetup';
import {createHealthBar, updateHealthBar} from "@/phaser/setup/healthBarSetup";
import { showPopup } from '@/components/PopUp';
import { checkWinCondition } from '@/components/WinCheck';
import {setupMultiplayerZone} from "@/phaser/setup/setupMultiplayerZone";



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

                const { bar, text } = createHealthBar(scene);
                scene.add.existing(bar);
                scene.add.existing(text);


                const baseHealth = scene.sessionPlayerMap?.get(data.playerId)?.baseHealth ?? 1000;

                scene.otherPlayerHealth.set(data.playerId, {
                    currentHealth: baseHealth,
                    baseHealth: baseHealth,
                    bar,
                    text,
                    displayedHealth: baseHealth,
                    isDead: false
                });



            }
        });

        scene.stompClient.subscribe(`/topic/victory/${scene.playerId}`, (message) => {
            console.log("[WebSocket] Sieg empfangen:", message.body);
            if (scene.hasShownVictoryPopup) return;
            scene.hasShownVictoryPopup = true;

            scene.time.delayedCall(200, () => {
                if (scene.player) {
                    scene.cameras.main.centerOn(scene.player.x, scene.player.y);
                } else {
                    console.warn("[Popup] scene.player noch nicht vorhanden beim Sieg.");
                    scene.cameras.main.centerOn(400, 300);
                }

                showPopup(scene, "🏆 Victory!\n💰 +300 Coins", () => {
                    const playerId = scene.playerId;
                    if (playerId) {
                        sessionStorage.setItem('playerId', playerId);
                        window.location.href = "/lobby";
                    } else {
                        console.warn('No playerId found – redirecting to login.');
                        window.location.href = "/login";
                    }
                });


            });
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
            console.log("[Health] WebSocket empfangen:", data);
            const isSelf = data.playerId === scene.playerId;

            if (isSelf) {
                scene.currentHealth = data.health;

                if (scene.currentHealth <= 0 && !scene.hasShownDeathPopup) {
                    scene.hasShownDeathPopup = true;
                    scene.player.setTint(0x000000);
                    scene.physics.pause();
                    showPopup(scene, "💀 You were defeated.\n💸 +100 Coins", () => {
                        const playerId = scene.playerId;
                        if (playerId) {
                            sessionStorage.setItem('playerId', playerId);
                            window.location.href = "/lobby";
                        } else {
                            console.warn('No playerId found – redirecting to login.');
                            window.location.href = "/login";
                        }
                    });

                    return;
                }


                updateHealthBar(scene.healthBarGraphics, scene.healthBarText, scene.player, scene.currentHealth, scene.baseHealth);
                scene.player.setTint(0xff0000);
                scene.time.delayedCall(200, () => scene.player.clearTint());
            } else {
                const entry = scene.otherPlayers.get(data.playerId);
                const healthData = scene.otherPlayerHealth.get(data.playerId);
                if (!entry || !healthData) return;

                if (healthData.currentHealth <= 0 && !healthData.isDead) {
                    console.log(`[Game] Spieler ${data.playerId} ist gestorben – prüfe Siegbedingung`);

                    healthData.isDead = true;

                    scene.time.delayedCall(200, () => {
                        checkWinCondition(scene);
                        entry.sprite.destroy();
                        healthData.bar.destroy();
                        healthData.text.destroy();
                        if (scene.projectiles) {
                            scene.projectiles.getChildren().forEach((proj: any) => {
                                if (proj.shooterId === data.playerId) {
                                    proj.destroy();
                                }
                            });
                        }
                        scene.otherPlayers.delete(data.playerId);
                        scene.otherPlayerHealth.delete(data.playerId);

                    });
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
                    scene.add.existing(bar);
                    scene.add.existing(text);


                    const baseHealth = scene.sessionPlayerMap?.get(p.playerId)?.baseHealth ?? 1000;

                    scene.otherPlayerHealth.set(p.playerId, {
                        currentHealth: baseHealth,
                        baseHealth: baseHealth,
                        bar,
                        text,
                        displayedHealth: baseHealth,
                        isDead: false // 🆕 damit checkWinCondition nicht mehrfach auslöst
                    });



                });

            });
        if (scene.gameMode === 'MULTIPLAYER') {
            console.log("[WebSocket] Verbindung steht – setupMultiplayerZone wird gestartet.");
            setupMultiplayerZone(scene);
        }
    };


    scene.stompClient.activate();
}
