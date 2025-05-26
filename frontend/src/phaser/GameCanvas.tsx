'use client';

import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import GameScene from './GameScene';
import { CharacterDTO } from './types'; // ← falls types.ts im gleichen Ordner liegt

export default function GameCanvas() {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const gameRef = useRef<Phaser.Game | null>(null);

    const [character, setCharacter] = useState<CharacterDTO | null>(null);
    const [playerId, setPlayerId] = useState<string | null>(null);

    useEffect(() => {
        async function fetchCharacter() {
            const id = crypto.randomUUID();
            setPlayerId(id);

            const res = await fetch(`http://localhost:8081/api/characters/next-available?playerId=${id}`);
            if (res.status === 409) {
                alert('Alle Charaktere sind bereits im Spiel!');
                return;
            }

            const data = await res.json();
            setCharacter(data);
        }

        fetchCharacter();
    }, []);

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
                arcade: { debug: true },
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
