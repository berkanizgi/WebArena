'use client';

import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import GameScene from './GameScene';
import { GameCharacterDTO } from './types'; // ← falls types.ts im gleichen Ordner liegt

export default function GameCanvas() {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const gameRef = useRef<Phaser.Game | null>(null);

    const [character, setCharacter] = useState<GameCharacterDTO | null>(null);
    const [playerId, setPlayerId] = useState<string | null>(null);

    useEffect(() => {
        const id = crypto.randomUUID();
        setPlayerId(id);
    }, []);

    useEffect(() => {
        if (!playerId) return;

        async function fetchCharacter() {
            const res = await fetch(`http://localhost:8081/api/characters/next-available?playerId=${playerId}`);

            if (res.status === 409) {
                alert('Alle Charaktere sind bereits im Spiel!');
                return;
            }

            const data = await res.json();
            setCharacter(data);

            await fetch('http://localhost:8081/api/characters/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerId: playerId, skin: data.skin })
            });
        }

        fetchCharacter();
    }, [playerId]);

    useEffect(() => {
        if (!containerRef.current || gameRef.current || !character || !playerId) return;

        gameRef.current = new Phaser.Game({
            type: Phaser.AUTO,
            width: 960,
            height: 640,
            parent: containerRef.current,
            scene: [new GameScene({ key: 'main', skin: character.skin, playerId })],
            physics: {
                default: 'arcade',
                arcade: { debug: false },
            },
            audio: {
                noAudio: true,
            },
        });

        return () => {
            gameRef.current?.destroy(true);
            gameRef.current = null;
        };
    }, [character, playerId]);

    if (!character || !playerId) return <div>Lade deinen Charakter...</div>;

    return <div ref={containerRef} />;
}
