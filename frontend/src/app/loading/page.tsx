'use client';

import { useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';
import { useSearchParams } from 'next/navigation';

interface JoinedPlayer {
    name: string;
    characterId: string;
}

const characterImageMap: Record<string, string> = {
    c1: '/lobby/black_char_lobby.png',
    c2: '/lobby/green_char_lobby.png',
    c3: '/lobby/red_char_lobby.png',
    c4: '/lobby/blue_char_lobby.png',
};

const tips = [
    '🛡️ Bleibe immer in Deckung.',
    '🎯 Ziele niemals ohne Plan.',
    '💡 Nutze Deckung, bevor du angreifst!',
    '🤝 Koordination gewinnt das Spiel.',
    '🔄 Bewegung ist Überleben.',
];

export default function LoadingPage() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('sessionId');
    const playerId = searchParams.get('playerId');

    const [client, setClient] = useState<Client | null>(null);
    const [players, setPlayers] = useState<JoinedPlayer[]>([]);
    const [tipIndex, setTipIndex] = useState(0);

    // TIPP ROTATION
    useEffect(() => {
        const interval = setInterval(() => {
            setTipIndex(prev => (prev + 1) % tips.length);
        }, 7000); // alle 7 Sekunden
        return () => clearInterval(interval);
    }, []);

    const [countdown, setCountdown] = useState<number | null>(null);

    useEffect(() => {
        const socket = new SockJS('http://localhost:8081/ws');
        const stompClient = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                stompClient.subscribe(`/topic/session/${sessionId}`, (message: IMessage) => {
                    const data = JSON.parse(message.body);
                    if (data.type === 'PLAYER_JOINED') {
                        setPlayers(prev => [...prev, data.player]);
                    }
                    if (data.type === 'COUNTDOWN') {
                        setCountdown(data.value);
                    }
                    if (data.type === 'START_GAME' && data.playerId === playerId) {
                        window.location.href = `/game/session/${sessionId}?playerId=${playerId}`;
                    }
                });
            },
        });

        stompClient.activate();
        setClient(stompClient);

        fetch(`http://localhost:8081/api/game-session/${sessionId}/players`)
            .then(res => res.json())
            .then((data: JoinedPlayer[]) => {
                setPlayers(data);
            });

        return () => {
            stompClient.deactivate();
        };
    }, [sessionId]);

    return (
        <div
            style={{
                width: '100vw',
                height: '100vh',
                backgroundColor: '#111',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontFamily: 'Bangers, cursive',
            }}
        >
            {/* ZENTRIERTES FENSTER 960x640 OHNE ABGERUNDETE ECKEN */}
            <div
                style={{
                    width: '960px',
                    height: '640px',
                    position: 'relative',
                    backgroundColor: '#222',
                    padding: '2rem',
                    boxShadow: '0 0 40px rgba(0,0,0,0.8)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: '#fff',
                }}
            >
                {/* HEADER */}
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ marginBottom: '0.5rem' }}>🕹 Matchmaking</h1>
                    <h2 style={{ marginBottom: '1rem' }}>{players.length} von 4 Spielern bereit</h2>
                    <div
                        style={{
                            width: '50px',
                            height: '50px',
                            border: '6px solid #fff',
                            borderTop: '6px solid #4CAF50',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto',
                        }}
                    />
                    <style>
                        {`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                        `}
                    </style>
                </div>

                {/* SPIELER */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '1.5rem',
                        flexWrap: 'wrap',
                        marginTop: '1.5rem',
                    }}
                >
                    {players.map((p, index) => (
                        <div
                            key={index}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                backgroundColor: '#333',
                                padding: '1rem',
                                width: '160px',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                            }}
                        >
                            <img
                                src={characterImageMap[p.characterId]}
                                alt="Character"
                                style={{
                                    width: '100px',
                                    height: '120px',
                                    objectFit: 'contain',
                                    marginBottom: '0.5rem',
                                }}
                            />
                            <div style={{ fontSize: '1.1rem', color: '#4CAF50' }}>{p.name}</div>
                        </div>
                    ))}
                </div>

                {/* Countdown-Anzeige */}
                {countdown !== null && (
                    <div style={{ fontSize: '2rem', marginTop: '2rem', color: '#FFD700' }}>
                        🚀 Spiel startet in {countdown} Sekunden ...
                    </div>
                )}


                {/* TIPP UNTEN */}
                <div style={{
                    marginTop: '2rem',
                    color: '#ccc',
                    fontSize: '1.1rem',
                    textAlign: 'center',
                    height: '2.5rem',
                }}>
                    <em>{tips[tipIndex]}</em>
                </div>
            </div>
        </div>
    );
}
