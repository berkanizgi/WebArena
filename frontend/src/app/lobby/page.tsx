'use client';

import { useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';
import { router } from 'next/client';

interface Player {
    playerId: string;
    ready: boolean;
    isHost: boolean;
    name: string;}

interface Wallet {
    xp: number;
    coins: number;
    selectedCharacterId: string;
}

interface Lobby {
    id: string;
    status: string;
    players: Player[];
}

export default function LobbyPage() {
    const [client, setClient] = useState<Client | null>(null);
    const [lobby, setLobby] = useState<Lobby | null>(null);
    const [playerId, setPlayerId] = useState<string | null>(null);
    const [playerName, setPlayerName] = useState<string | null>(null);
    const [wallet, setWallet] = useState<Wallet | null>(null);

    // WebSocket verbinden
    useEffect(() => {
        const socket = new SockJS('http://localhost:8081/ws');
        const stompClient = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                console.log('✅ WebSocket verbunden');

                stompClient.subscribe('/topic/lobby', (message: IMessage) => {
                    const data = JSON.parse(message.body);
                    console.log('[WebSocket LOBBY_DATA]:', data);
                    console.log('[Players]:', data.lobby.players);
                    if (data.type === 'LOBBY_CREATED' || data.type === 'LOBBY_UPDATED') {
                        setLobby(data.lobby);
                    }
                });

                const storedId = localStorage.getItem('playerId');
                if (storedId) {
                    stompClient.publish({
                        destination: '/app/joinLobby',
                        body: JSON.stringify({ playerId: storedId }),
                    });
                }
            },
        });

        stompClient.activate();
        setClient(stompClient);

        return () => {
            stompClient.deactivate();
        };
    }, []);

    // Spielerinfos + Wallet laden
    useEffect(() => {
        const idFromStorage = localStorage.getItem('playerId');
        if (!idFromStorage) {
            alert("Nicht eingeloggt!");
            router.push('/login');
            return;
        }

        setPlayerId(idFromStorage);

        fetch(`http://localhost:8081/api/players/${idFromStorage}`)
            .then(res => res.json())
            .then(data => {
                setPlayerName(data.username);
                setWallet({
                    xp: data.wallet.xp,
                    coins: data.wallet.coins,
                    selectedCharacterId: data.wallet.selectedCharacterId
                });
            });
    }, []);

    const setReady = () => {
        if (client && client.connected && lobby) {
            client.publish({
                destination: '/app/setReady',
                body: JSON.stringify({ playerId, lobbyId: lobby.id }),
            });
        }
    };

    const startGameSession = async () => {
        if (!playerId) return;

        try {
            const res = await fetch(`http://localhost:8081/api/game-session/start?playerId=${playerId}`, {
                method: 'POST',
            });

            if (!res.ok) {
                alert('Fehler beim Starten der Game Session');
                return;
            }

            const data = await res.json();
            const sessionId = data.sessionId;
            window.location.href = `/loading?playerId=${playerId}&sessionId=${sessionId}`;
        } catch (err) {
            console.error('Fehler beim Start:', err);
        }
    };

    const me = lobby?.players.find(p => p.playerId === playerId);

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100vw',
                height: '100vh',
                backgroundColor: '#111',
            }}
        >
            <div
                style={{
                    width: '960px',
                    height: '640px',
                    display: 'flex',
                    flexDirection: 'row',
                    backgroundImage: 'url("/lobby/Lobby_Frame.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    fontFamily: 'Bangers, cursive',
                    color: '#fff',
                }}
            >
                {/* Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem', minWidth: '180px' }}>
                    <GameButton label="CHARACTERS" />
                    <GameButton label="SHOP" />
                    <GameButton label="MISSIONS" />
                </div>

                {/* Center Info */}
                <div style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <p>👤 {playerName}</p>
                    <p>🎭 Charakter-ID: {wallet?.selectedCharacterId}</p>
                    <p>⭐ XP: {wallet?.xp}</p>
                    <p>💰 Coins: {wallet?.coins}</p>
                    {me && (
                        <GameButton
                            label={me.ready ? '✅ Ready' : '❌ Not Ready'}
                            onClick={setReady}
                            styleOverride={{
                                marginTop: '2rem',
                                backgroundColor: me.ready ? '#4CAF50' : '#ff9800',
                            }}
                        />
                    )}
                </div>

                {/* Right Buttons */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        padding: '2rem',
                        alignItems: 'flex-end',
                    }}
                >
                    <GameButton label="TUTORIAL" />
                    <GameButton
                        label="PLAY"
                        styleOverride={{
                            backgroundColor: me?.ready ? '#4CAF50' : '#777',
                            cursor: me?.ready ? 'pointer' : 'not-allowed',
                        }}
                        onClick={me?.ready ? startGameSession : undefined}
                    />
                </div>
            </div>
        </div>
    );
}

function GameButton({
                        label,
                        styleOverride = {},
                        onClick,
                    }: {
    label: string;
    styleOverride?: React.CSSProperties;
    onClick?: () => void;
}) {
    return (
        <button
            onClick={onClick}
            style={{
                width: '160px',
                height: '55px',
                backgroundColor: '#2196F3',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '2px 2px #000',
                fontFamily: 'Bangers, cursive',
                cursor: 'pointer',
                ...styleOverride,
            }}
        >
            {label}
        </button>
    );
}