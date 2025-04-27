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

export default function ProjectileManager({ client, mapSize }: { client: Client, mapSize: { x: number; y: number } }) {
    const [projectiles, setProjectiles] = useState<Projectile[]>([]);

    useEffect(() => {
        if (!client || !client.connected) return;

        const subscription = client.subscribe('/topic/attacks', (message: IMessage) => {
            const event: AttackEvent = JSON.parse(message.body);

            const id = Date.now() + '-' + Math.random();

            const startX = mapSize.x / 2 + event.playerX;
            const startY = mapSize.y / 2 + event.playerY;

            const newProjectile: Projectile = {
                id: id.toString(),
                x: startX,
                y: startY,
                dirX: event.dirX,
                dirY: event.dirY,
            };

            setProjectiles(prev => [...prev, newProjectile]);

            setTimeout(() => {
                setProjectiles(prev => prev.filter(p => p.id !== id.toString()));
            }, 2000);
        });

        return () => subscription.unsubscribe();
    }, [client?.connected, mapSize]);

    useEffect(() => {
        const interval = setInterval(() => {
            setProjectiles(prev =>
                prev.map(p => ({
                    ...p,
                    x: p.x + p.dirX * 5,
                    y: p.y + p.dirY * 5,
                }))
            );
        }, 16);
        return () => clearInterval(interval);
    }, []);

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
