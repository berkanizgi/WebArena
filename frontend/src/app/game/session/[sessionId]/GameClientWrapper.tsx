'use client';

import dynamic from 'next/dynamic';

const GameCanvas = dynamic(() => import('@/phaser/GameCanvas'), {
    ssr: false, // ⛔ verhindert SSR → `window is not defined` wird vermieden
});

export default function GameClientWrapper({ sessionId, playerId }: { sessionId: string; playerId: string }) {
    return <GameCanvas sessionId={sessionId} playerId={playerId} />;
}
