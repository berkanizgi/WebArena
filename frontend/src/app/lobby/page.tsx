'use client';

import { useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';
import { router } from 'next/client';

interface Player {
    playerId: string;
    ready: boolean;
    isHost: boolean;
    name: string;
}

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

    const characterImageMap: Record<string, string> = {
        c1: '/lobby/black_char_lobby.png',
        c2: '/lobby/green_char_lobby.png',
        c3: '/lobby/red_char_lobby.png',
        c4: '/lobby/blue_char_lobby.png',
    };

    useEffect(() => {
        const socket = new SockJS('http://localhost:8081/ws');
        const stompClient = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                stompClient.subscribe('/topic/lobby', (message: IMessage) => {
                    const data = JSON.parse(message.body);
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

    useEffect(() => {
        const idFromStorage = localStorage.getItem('playerId');
        if (!idFromStorage) {
            alert('Nicht eingeloggt!');
            router.push('/login');
            return;
        }

        setPlayerId(idFromStorage);

        fetch(`http://localhost:8081/api/players/${idFromStorage}`)
            .then((res) => res.json())
            .then((data) => {
                setPlayerName(data.username);
                const walletData = {
                    xp: data.wallet.xp,
                    coins: data.wallet.coins,
                    selectedCharacterId: data.wallet.selectedCharacterId,
                };
                setWallet(walletData);
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

    const goToShop = () => {
        if (playerId && playerName && wallet) {
            localStorage.setItem('shopPlayerId', playerId);
            localStorage.setItem('shopPlayerName',playerName)
            localStorage.setItem('shopWallet', JSON.stringify(wallet));
            window.location.href = '/shop';
        }
    };

    const me = lobby?.players.find((p) => p.playerId === playerId);

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
            {/* === LOBBY-FENSTER (feste Größe 960x640) === */}
            <div
                style={{
                    width: '960px',
                    height: '640px',
                    position: 'relative',
                    backgroundImage: 'url("/lobby/Lobby_Frame.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    color: '#fff',
                    overflow: 'hidden',
                }}
            >
                {/* === OBEN LINKS: USERINFO === */}
                <div
                    style={{
                        position: 'absolute',
                        top: '20px',
                        left: '20px',
                        display: 'flex',
                        gap: '1rem',
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        padding: '10px 20px',
                        borderRadius: '12px',
                        fontSize: '1rem',
                    }}
                >
                    <div>👤 {playerName}</div>
                    <div>⭐ XP: {wallet?.xp}</div>
                    <div>💰 {wallet?.coins}</div>
                </div>

                {/* === OBEN RECHTS: Buttons === */}
                <div
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                    }}
                >
                    <GameButton label="Multiplayer" />
                    <GameButton
                        label="PLAY"
                        styleOverride={{
                            backgroundColor: me?.ready ? '#4CAF50' : '#777',
                            cursor: me?.ready ? 'pointer' : 'not-allowed',
                        }}
                        onClick={me?.ready ? startGameSession : undefined}
                    />
                </div>

                {/* === SIDEBAR LINKS UNTEN === */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: '40px',
                        left: '40px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                    }}
                >
                    <GameButton label="CHARACTERS" onClick={() => window.location.href = '/character'} />
                    <GameButton label="SHOP" onClick={goToShop} />
                    <GameButton label="MISSIONS" />
                </div>

                {/* === CHARACTER MITTE ↑ === */}
                {wallet?.selectedCharacterId && characterImageMap[wallet.selectedCharacterId] && (
                    <img
                        src={characterImageMap[wallet.selectedCharacterId]}
                        alt="Character"
                        style={{
                            position: 'absolute',
                            bottom: '50px',
                            left: '47%',
                            transform: 'translateX(-50%)',
                            width: '240px',        // ← feste Breite
                            height: '300px',       // ← feste Höhe
                            objectFit: 'contain',  // ← skaliert Bild korrekt ins Format
                            zIndex: 10,
                            filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.8))',
                        }}
                    />

                )}

                {/* === READY BUTTON UNTEN MITTE === */}
                {me && (
                    <div
                        style={{
                            position: 'absolute',
                            bottom: '30px',
                            left: '80%',
                            transform: 'translateX(-50%)',
                        }}
                    >
                        <GameButton
                            label={me.ready ? '✅ Ready' : '❌ Not Ready'}
                            onClick={setReady}
                            styleOverride={{
                                backgroundColor: me.ready ? '#4CAF50' : '#ff9800',
                                width: '200px',
                            }}
                        />
                    </div>
                )}
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
