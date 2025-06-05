'use client';

import { useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';
import { router } from 'next/client';

interface Player {
    id: string;
    ready: boolean;
    isHost: boolean;
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
    const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);

    // --- WebSocket Setup ---
    useEffect(() => {
        const socket = new SockJS('http://localhost:8081/ws');
        const stompClient = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                stompClient.subscribe('/topic/lobby', (message: IMessage) => {
                    const data = JSON.parse(message.body);

                    if (data.type === 'LOBBY_CREATED' || data.type === 'LOBBY_UPDATED') {
                        setLobby(data.lobby); // wichtig: du brauchst das komplette `lobby`-Objekt
                    }
                });

            },
        });

        stompClient.activate();
        setClient(stompClient);

        return () => {
            client?.deactivate();
        };
    }, []);

    // --- Player Info aus localStorage ---
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
                setSelectedCharacterId(data.selectedCharacterId);
            });
    }, []);

    const createLobby = () => {
        if (client && client.connected) {
            client.publish({
                destination: '/app/createLobby',
                body: JSON.stringify({ playerId }),
            });
        }
    };

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

                {/* Main Content */}
                <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                    <p>👤 {playerName}</p>
                    <p>🎭 Charakter-ID: {selectedCharacterId}</p>

                    {!lobby && (
                        <button
                            onClick={createLobby}
                            style={{
                                padding: '1rem 2rem',
                                fontSize: '1.5rem',
                                backgroundColor: '#673ab7',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '20px',
                                marginTop: '1rem',
                                cursor: 'pointer',
                            }}
                        >
                            ➕ Create Lobby
                        </button>
                    )}

                    {lobby && (
                        <div
                            style={{
                                marginTop: '2rem',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                padding: '1rem',
                                borderRadius: '10px',
                                maxWidth: '500px',
                            }}
                        >
                            <h2>Lobby ID: {lobby.id}</h2>
                            <p>Status: {lobby.status}</p>
                            <p>🛠 Aktueller Status: {lobby.status}</p>

                            <p>Ich bin: {playerId}</p>
                            <ul>
                                {lobby.players.map((p) => (
                                    <li key={p.id}>
                                        {p.id} {p.isHost && '(Host)'} – {p.ready ? '✅' : '❌'}
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={setReady}
                                style={{
                                    marginTop: '1rem',
                                    padding: '0.5rem 1rem',
                                    backgroundColor: '#ff9800',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                }}
                            >
                                ✅ Ready
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem', alignItems: 'flex-end' }}>
                    <GameButton label="TUTORIAL" />
                    <GameButton
                        label="PLAY"
                        styleOverride={{
                            backgroundColor: lobby?.status === 'STARTED' ? '#4CAF50' : '#777',
                            cursor: lobby?.status === 'STARTED' ? 'pointer' : 'not-allowed',
                        }}
                        onClick={lobby?.status === 'STARTED' ? startGameSession : undefined}
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
