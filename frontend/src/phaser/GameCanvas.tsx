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
    const [sessionPlayers, setSessionPlayers] = useState<SessionPlayerDTO[]>([]);

    useEffect(() => {
        async function fetchSessionPlayer() {
            const res = await fetch(`http://localhost:8081/api/game-session/${sessionId}/me?playerId=${playerId}`);
            const data = await res.json();
            setSessionPlayer(data);
        }

        fetchSessionPlayer();
    }, [playerId, sessionId]);

    useEffect(() => {
        async function fetchAllPlayers() {
            const res = await fetch(`http://localhost:8081/api/game-session/${sessionId}/players`);
            const data = await res.json();
            setSessionPlayers(data);
        }

        fetchAllPlayers();
    }, [sessionId]);

    useEffect(() => {
        if (!containerRef.current || gameRef.current || !sessionPlayer || sessionPlayers.length === 0) return;

        const sessionPlayerMap = new Map<string, SessionPlayerDTO>();
        sessionPlayers.forEach(p => sessionPlayerMap.set(p.playerId, p));

        const config = {
            key: 'main',
            playerId: sessionPlayer.playerId,
            skin: skinMap[sessionPlayer.characterId],
            characterId: sessionPlayer.characterId,
            baseAttack: sessionPlayer.baseAttack,
            baseHealth: sessionPlayer.baseHealth,
            speed: sessionPlayer.speed,
            sessionId: sessionId,
            gameMode: sessionPlayer.gameMode,
        };

        const scene = new GameScene(config);
        scene.sessionPlayerMap = sessionPlayerMap;

        gameRef.current = new Phaser.Game({
            type: Phaser.AUTO,
            width: 960,
            height: 640,
            parent: containerRef.current,
            scene: [scene],
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
    }, [sessionPlayer, sessionPlayers]);

    if (!sessionPlayer) return <div>Lade deine Sessiondaten...</div>;

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
            <div ref={containerRef} style={{ width: '960px', height: '640px' }} />
        </div>
    );
}
