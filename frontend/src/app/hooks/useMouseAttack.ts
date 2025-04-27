'use client';
import { useEffect } from 'react';

interface AttackRequest {
    x: number;
    y: number;
    playerId: string;
    timestamp: number;
}

export function useMouseAttack(client: any, characterId: string) {
    useEffect(() => {
        if (!client || !client.connected) return;

        const handleMouseDown = (event: MouseEvent) => {
            if (event.button !== 0) return; // Nur linke Maustaste

            console.log("Mouse clicked, trying to send attack...");


            const attackRequest: AttackRequest = {
                x: event.clientX,  // oder clientX relativ zur Map, falls nötig
                y: event.clientY,
                playerId: characterId,
                timestamp: Date.now()
            };

            client.send('/app/attack', {}, JSON.stringify(attackRequest));
        };

        window.addEventListener('mousedown', handleMouseDown);

        return () => {
            window.removeEventListener('mousedown', handleMouseDown);
        };
    }, [client, characterId]);
}
