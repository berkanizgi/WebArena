'use client';

import dynamic from 'next/dynamic';

const GameCanvas = dynamic(() => import('@/phaser/GameCanvas'), {
    ssr: false, // kein SSR wegen "window is not defined"
});

export default function Page() {
    return (
        <div className="flex justify-center items-center w-screen h-screen bg-[#111]">
            <GameCanvas/>
        </div>
    );
}
