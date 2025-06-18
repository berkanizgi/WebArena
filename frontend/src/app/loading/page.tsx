'use client';

import { useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';
import { useRouter, useSearchParams } from 'next/navigation';

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
    const router = useRouter();
    const sessionId = searchParams.get('sessionId');
    const playerId = searchParams.get('playerId');

    const [client, setClient] = useState<Client | null>(null);
    const [players, setPlayers] = useState<JoinedPlayer[]>([]);
    const [tipIndex, setTipIndex] = useState(0);
    const [countdown, setCountdown] = useState<number | null>(null);

    // Tipp-Rotation
    useEffect(() => {
        const interval = setInterval(() => {
            setTipIndex(prev => (prev + 1) % tips.length);
        }, 7000);
        return () => clearInterval(interval);
    }, []);

    // WebSocket-Verbindung & Datenabruf
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
                        router.push(`/game/session/${sessionId}?playerId=${playerId}`);
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
                backgroundImage: 'url("/lobby/Lobby_Frame.png")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                fontFamily: 'Bangers, cursive',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
            }}
        >
            <div
                style={{
                    width: '100%',
                    maxWidth: '1400px',
                    height: '90%',
                    backgroundColor: 'rgba(0,0,0,0.75)',
                    padding: '3rem',
                    borderRadius: '20px',
                    boxShadow: '0 0 40px rgba(0,0,0,0.9)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: '#fff',
                    textAlign: 'center',
                }}
            >
                {/* Header */}
                <div>
                    <h1 style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>🕹 Matchmaking</h1>
                    <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                        {players.length} von 4 Spielern bereit
                    </h2>
                    <div
                        style={{
                            width: '60px',
                            height: '60px',
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

                {/* Spielerübersicht */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '2rem',
                        flexWrap: 'wrap',
                        marginTop: '2rem',
                    }}
                >
                    {players.map((p, index) => (
                        <div
                            key={index}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                backgroundColor: '#222',
                                padding: '1.2rem',
                                width: '180px',
                                borderRadius: '12px',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.6)',
                            }}
                        >
                            <img
                                src={characterImageMap[p.characterId]}
                                alt="Character"
                                style={{
                                    width: '120px',
                                    height: '140px',
                                    objectFit: 'contain',
                                    marginBottom: '0.7rem',
                                }}
                            />
                            <div style={{ fontSize: '1.4rem', color: '#4CAF50' }}>{p.name}</div>
                        </div>
                    ))}
                </div>

                {/* Countdown-Anzeige */}
                {countdown !== null && (
                    <div style={{ fontSize: '2.5rem', marginTop: '2.5rem', color: '#FFD700' }}>
                        🚀 Spiel startet in {countdown} Sekunden ...
                    </div>
                )}

                {/* Tipp unten */}
                <div
                    style={{
                        marginTop: '2rem',
                        color: '#ccc',
                        fontSize: '1.5rem',
                        height: '3rem',
                        textAlign: 'center',
                    }}
                >
                    <em>{tips[tipIndex]}</em>
                </div>
            </div>
        </div>
    );
}
