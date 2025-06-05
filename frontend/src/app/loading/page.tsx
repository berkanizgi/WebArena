'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function GameLoadingPage() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('sessionId');

    const [playersReady, setPlayersReady] = useState(1); // start bei dir selbst
    const [totalPlayers, setTotalPlayers] = useState(4); // angenommen Ziel ist 4

    // Hier abonnierst du z. B. per WebSocket Updates zum Ladefortschritt
    useEffect(() => {
        const interval = setInterval(() => {
            // ⛔ Ersetze das hier durch echten API-Call oder WebSocket
            fetch(`http://localhost:8081/api/game-session/status?sessionId=${sessionId}`)
                .then(res => res.json())
                .then(data => {
                    setPlayersReady(data.readyCount);
                    setTotalPlayers(data.totalCount);

                    if (data.readyCount >= data.totalCount) {
                        window.location.href = `/game/session/${sessionId}`; // echte GameView
                    }
                });
        }, 1000);

        return () => clearInterval(interval);
    }, [sessionId]);

    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            backgroundColor: '#111',
            color: '#fff',
            fontFamily: 'Bangers, cursive',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <h1>🌐 Spiel wird vorbereitet...</h1>
            <p>🧑‍🤝‍🧑 Spieler bereit: {playersReady} / {totalPlayers}</p>
            <div className="spinner" style={{
                marginTop: '2rem',
                width: '50px',
                height: '50px',
                border: '6px solid #999',
                borderTop: '6px solid #4CAF50',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
            }} />
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
