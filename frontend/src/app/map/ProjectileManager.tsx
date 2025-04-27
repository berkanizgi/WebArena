'use client';
import { useEffect, useState } from 'react';
import type { Client, IMessage } from '@stomp/stompjs';

interface AttackEvent {
    playerId: string;
    playerX: number;
    playerY: number;
    dirX: number;
    dirY: number;
}

interface Projectile {
    id: string;
    x: number;
    y: number;
    dirX: number;
    dirY: number;
}

export default function ProjectileManager({ client }: { client: Client }) {
    const [projectiles, setProjectiles] = useState<Projectile[]>([]);
    const [mapSize] = useState({ width: 1000, height: 600 });
    const [mapCenter] = useState({ x: 500, y: 300 }); // Mitte der Map

    useEffect(() => {
        if (!client || !client.connected) return;

        const subscription = client.subscribe('/topic/attacks', (message: IMessage) => {
            const event: AttackEvent = JSON.parse(message.body);

            const id = Date.now() + '-' + Math.random();

            const startX = mapCenter.x + event.playerX;
            const startY = mapCenter.y + event.playerY -8;


            const newProjectile: Projectile = {
                id: id.toString(),
                x: startX,
                y: startY,
                dirX: event.dirX,
                dirY: event.dirY,
            };

            setProjectiles(prev => [...prev, newProjectile]);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [client?.connected, mapCenter]);

    useEffect(() => {
        const interval = setInterval(() => {
            setProjectiles(prev =>
                prev
                    .map(p => ({
                        ...p,
                        x: p.x + p.dirX * 5,
                        y: p.y + p.dirY * 5,
                    }))
                    .filter(p =>
                        p.x >= 0 &&
                        p.x <= mapSize.width &&
                        p.y >= 0 &&
                        p.y <= mapSize.height
                    ) // ❗ Nur Projektile innerhalb der Map behalten
            );
        }, 16);
        return () => clearInterval(interval);
    }, [mapSize]);

    return (
        <>
            {projectiles.map((p) => (
                <div
                    key={p.id}
                    className="absolute w-2 h-2 bg-black rounded-full"
                    style={{
                        top: `${p.y}px`,
                        left: `${p.x}px`,
                        transform: 'translate(-50%, -50%)',
                    }}
                />
            ))}
        </>
    );
}
