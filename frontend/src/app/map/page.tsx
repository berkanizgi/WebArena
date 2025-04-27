'use client';
import { useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import type { IMessage } from '@stomp/stompjs';
import { v4 as uuidv4 } from 'uuid';
import { useMouseAttack } from '../hooks/useMouseAttack';

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

export default function Page() {
    const [mapSize, setMapSize] = useState<{ x: number; y: number } | null>(null);
    const [positions, setPositions] = useState<CharacterPositionDTO[]>([]);
    const [characterId] = useState<string>(() => uuidv4());
    const [client, setClient] = useState<any>(null);
    const [rotation, setRotation] = useState<number>(0);

    useMouseAttack(client, characterId);

    useEffect(() => {
        fetch("http://localhost:8080/api/map")
            .then(res => res.json())
            .then(data => setMapSize(data));

        const socket = new SockJS('http://localhost:8081/ws');
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

            fetch("http://localhost:8081/api/positions")
                .then(res => res.json())
                .then((players: CharacterPositionDTO[]) => {
                    setPositions(players);
                });
        });

        return () => {
            stompClient.disconnect(() => console.log("WebSocket disconnected."));
        };
    }, []);

    // 👉 Mausbewegung nur für Rotation
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

            client.send('/app/rotate', {}, JSON.stringify({
                characterId,
                rotation: correctedAngle
            }));

        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [client, positions]);

    // 👉 WASD Bewegung
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (!client || !client.connected) return;
            let direction: string | null = null;

            switch (event.key.toLowerCase()) {
                case 'w':
                    direction = 'UP';
                    break;
                case 'd':
                    direction = 'RIGHT';
                    break;
                case 's':
                    direction = 'DOWN';
                    break;
                case 'a':
                    direction = 'LEFT';
                    break;
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

    if (!mapSize) return <div>Lade Karte...</div>;

    const centerX = mapSize.x / 2;
    const centerY = mapSize.y / 2;

    return (
        <div className="flex justify-center items-center w-screen h-screen bg-gray-100">
            <div
                className="relative bg-white border-4 border-black"
                style={{ width: `${mapSize.x}px`, height: `${mapSize.y}px` }}
            >
                {positions.map((pos) => (
                    <div
                        key={`${pos.characterId}-${pos.x}-${pos.y}`}
                        className="absolute"
                        style={{
                            top: `${centerY + pos.y}px`,
                            left: `${centerX + pos.x}px`,
                            width: 0,
                            height: 0,
                            borderLeft: '10px solid transparent',
                            borderRight: '10px solid transparent',
                            borderBottom: `20px solid ${getColorFromId(pos.characterId)}`,
                            transform: `translate(-50%, -100%) rotate(${pos.rotation}deg)`,
                            transition: 'top 0.1s, left 0.1s, transform 0.1s ease',
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
