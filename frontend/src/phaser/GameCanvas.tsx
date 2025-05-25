'use client';

import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import GameScene from './GameScene';

export default function GameCanvas() {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const gameRef = useRef<Phaser.Game | null>(null);

    useEffect(() => {
        if (!containerRef.current || gameRef.current) return;

        gameRef.current = new Phaser.Game({
            type: Phaser.AUTO,
            width: 960,
            height: 640,
            parent: containerRef.current,
            scene: [GameScene],
            physics: {
                default: 'arcade',
                arcade: { debug: true },
            },
            audio: {
                noAudio: true
            },
        });


        return () => {
            gameRef.current?.destroy(true);
            gameRef.current = null;
        };
    }, []);

    return <div ref={containerRef} />;
}
