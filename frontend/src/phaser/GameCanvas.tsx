'use client';

import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import GameScene from './GameScene';
import { SessionPlayerDTO } from './types';

export default function GameCanvas({ playerId, sessionId }: { playerId: string; sessionId: string }) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const gameRef = useRef<Phaser.Game | null>(null);

    const skinMap: Record<string, string> = {
        c1: 'black_asha',
        c2: 'green_asha',
        c3: 'red_asha',
        c4: 'blue_asha'
    };

    const [sessionPlayer, setSessionPlayer] = useState<SessionPlayerDTO | null>(null);

    useEffect(() => {
        async function fetchSessionPlayer() {
            const res = await fetch(`http://localhost:8081/api/game-session/${sessionId}/me?playerId=${playerId}`);
            const data = await res.json();
            console.log("[CLIENT] SessionPlayer geladen:", data);
            setSessionPlayer(data);
        }

        fetchSessionPlayer();
    }, [playerId, sessionId]);

    useEffect(() => {
        if (!containerRef.current || gameRef.current || !sessionPlayer) return;

        const config = {
            key: 'main',
            playerId: sessionPlayer.playerId,
            skin: skinMap[sessionPlayer.characterId],
            characterId: sessionPlayer.characterId,
            baseAttack: sessionPlayer.baseAttack,
            baseHealth: sessionPlayer.baseHealth,
            speed: sessionPlayer.speed,
        };

        console.log("[GameCanvas] Konfiguration für GameScene:", config);

        gameRef.current = new Phaser.Game({
            type: Phaser.AUTO,
            width: 960,
            height: 640,
            parent: containerRef.current,
            scene: [new GameScene(config)],
            physics: {
                default: 'arcade',
                arcade: { debug: false },
            },
            audio: { noAudio: true },
        });

        return () => {
            gameRef.current?.destroy(true);
            gameRef.current = null;
        };
    }, [sessionPlayer]);

    if (!sessionPlayer) return <div>Lade deine Sessiondaten...</div>;

    // ✅ Zentriert in der Mitte, wie bei Lobby
    return (
        <div
            style={{
                width: '100vw',
                height: '100vh',
                backgroundColor: '#111',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <div
                ref={containerRef}
                style={{
                    width: '960px',
                    height: '640px',
                }}
            />
        </div>
    );
}
