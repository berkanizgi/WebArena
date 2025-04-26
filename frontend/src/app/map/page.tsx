'use client';
import { useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import type { IMessage } from '@stomp/stompjs';
import { v4 as uuidv4 } from 'uuid';



interface CharacterPositionDTO {
    characterId: string;
    x: number;
    y: number;
}

export default function Page() {
    const [mapSize, setMapSize] = useState<{ x: number; y: number } | null>(null);
    const [positions, setPositions] = useState<CharacterPositionDTO[]>([]);
    const [characterId] = useState<string>(() => uuidv4());
    const [client, setClient] = useState<any>(null);

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

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (!client || !client.connected) return;
            let direction: string | null = null;
            switch (event.key) {
                case 'w': direction = 'UP'; break;
                case 's': direction = 'DOWN'; break;
                case 'a': direction = 'LEFT'; break;
                case 'd': direction = 'RIGHT'; break;
            }
            if (direction) {
                client.send('/app/move', {}, JSON.stringify({ characterId, direction }));
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [client]);

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
                            borderBottom: '20px solid blue',
                            transform: 'translate(-50%, -100%)',
                            transition: 'top 0.1s, left 0.1s',
                        }}
                    />
                ))}

            </div>
        </div>
    );
}