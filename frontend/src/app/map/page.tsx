'use client';
import { useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import type { IMessage } from '@stomp/stompjs';
import { v4 as uuidv4 } from 'uuid';
import { useMouseAttack } from '../hooks/useMouseAttack';
import { useCooldown } from '../hooks/useCooldown';
import ProjectileManager from './ProjectileManager';

interface CharacterPositionDTO {
    characterId: string;
    x: number;
    y: number;
    rotation: number;
}

function getColorFromId(id: string) {
    const colors = ['blue', 'red', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan', 'lime', 'magenta'];
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
}

// Rotationsglättung
function normalizeAngle(prev: number, target: number): number {
    let delta = target - prev;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    return prev + delta;
}

export default function Page() {
    const [mapSize, setMapSize] = useState<{ x: number; y: number } | null>(null);
    const [positions, setPositions] = useState<CharacterPositionDTO[]>([]);
    const [characterId] = useState<string>(() => uuidv4());
    const [client, setClient] = useState<any>(null);
    const [rotation, setRotation] = useState<number>(0);
    const [lastSentRotation, setLastSentRotation] = useState<number>(0);

    const { cooldownProgress, trigger: triggerCooldown } = useCooldown(1000);

    useMouseAttack(client, characterId);

    useEffect(() => {
        fetch("http://10.0.40.182:8080/api/map")
            .then(res => res.json())
            .then(data => setMapSize(data));

        const socket = new SockJS('http://10.0.40.182:8081/ws');
        const stompClient = Stomp.over(socket);
        setClient(stompClient);

        stompClient.connect({}, () => {
            stompClient.subscribe('/topic/movement', (message: IMessage) => {
                const updatedPosition: CharacterPositionDTO = JSON.parse(message.body);
                setPositions((prev) => {
                    const filtered = prev.filter(p => p.characterId !== updatedPosition.characterId);
                    return [...filtered, updatedPosition];
                });
            });

            fetch("http://10.0.40.182:8081/api/positions")
                .then(res => res.json())
                .then((players: CharacterPositionDTO[]) => {
                    setPositions(players);
                });
        });

        return () => {
            stompClient.disconnect(() => console.log("WebSocket disconnected."));
        };
    }, []);

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            if (!client || !client.connected) return;

            const player = positions.find(p => p.characterId === characterId);
            if (!player) return;

            const centerX = window.innerWidth / 2 + player.x;
            const centerY = window.innerHeight / 2 + player.y;

            const dx = event.clientX - centerX;
            const dy = event.clientY - centerY;

            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            const correctedAngle = (angle + 90 + 360) % 360;

            setRotation(correctedAngle);

            const angleDiff = Math.abs(correctedAngle - lastSentRotation);
            const minimalDiff = Math.min(angleDiff, 360 - angleDiff);

            if (minimalDiff > 2) {
                client.send('/app/rotate', {}, JSON.stringify({
                    characterId,
                    rotation: correctedAngle
                }));
                setLastSentRotation(correctedAngle);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [client, positions]);

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (!client || !client.connected) return;

            let direction: string | null = null;
            switch (event.key.toLowerCase()) {
                case 'w': direction = 'UP'; break;
                case 'd': direction = 'RIGHT'; break;
                case 's': direction = 'DOWN'; break;
                case 'a': direction = 'LEFT'; break;
            }
            if (direction) {
                client.send('/app/move', {}, JSON.stringify({
                    characterId,
                    direction,
                    rotation
                }));
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [client, rotation]);

    useEffect(() => {
        const handleMouseClick = (event: MouseEvent) => {
            if (!client || !client.connected || cooldownProgress < 1) return;

            const player = positions.find(p => p.characterId === characterId);
            if (!player) return;

            const spielfeld = document.querySelector<HTMLDivElement>('.relative.bg-white.border-4.border-black');
            if (!spielfeld) return;

            const rect = spielfeld.getBoundingClientRect();
            const mouseX = event.clientX - rect.left - rect.width / 2;
            const mouseY = event.clientY - rect.top - rect.height / 2;

            const attackMessage = {
                playerId: characterId,
                playerX: player.x,
                playerY: player.y,
                x: mouseX,
                y: mouseY,
            };

            client.send('/app/attack', {}, JSON.stringify(attackMessage));
            triggerCooldown();
        };

        window.addEventListener('click', handleMouseClick);
        return () => window.removeEventListener('click', handleMouseClick);
    }, [client, positions, characterId, cooldownProgress]);

    if (!mapSize) return <div>Lade Karte...</div>;

    const centerX = mapSize.x / 2;
    const centerY = mapSize.y / 2;

    return (
        <div className="flex justify-center items-center w-screen h-screen bg-gray-100">
            <div
                className="relative bg-white border-4 border-black"
                style={{ width: `${mapSize.x}px`, height: `${mapSize.y}px` }}
            >
                {positions.map((pos) => {
                    const angle = pos.characterId === characterId
                        ? normalizeAngle(rotation, pos.rotation)
                        : pos.rotation;

                    return (
                        <div key={`${pos.characterId}-${pos.x}-${pos.y}`}>
                            <div
                                className="absolute"
                                style={{
                                    top: `${centerY + pos.y}px`,
                                    left: `${centerX + pos.x}px`,
                                    width: 0,
                                    height: 0,
                                    borderLeft: '10px solid transparent',
                                    borderRight: '10px solid transparent',
                                    borderBottom: `20px solid ${getColorFromId(pos.characterId)}`,
                                    transform: `translate(-50%, -100%) rotate(${angle}deg)`,
                                    transition: 'top 0.1s, left 0.1s',
                                }}
                            />
                            {pos.characterId === characterId && cooldownProgress < 1 && (
                                <div
                                    className="absolute bg-gray-300"
                                    style={{
                                        top: `${centerY + pos.y - 30}px`,
                                        left: `${centerX + pos.x - 25}px`,
                                        width: '50px',
                                        height: '6px',
                                        borderRadius: '3px',
                                        overflow: 'hidden',
                                        border: '1px solid #666',
                                    }}
                                >
                                    <div
                                        className="bg-green-500 h-full"
                                        style={{
                                            width: `${cooldownProgress * 100}%`,
                                            transition: 'width 0.1s linear',
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
                {client && mapSize && (
                    <ProjectileManager client={client} mapSize={mapSize} />
                )}
            </div>
        </div>
    );
}
