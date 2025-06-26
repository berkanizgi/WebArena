'use client';

import { useEffect, useMemo, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Player {
    playerId: string;
    isHost: boolean;
    name: string;
}

interface Wallet {
    xp: number;
    coins: number;
    selectedCharacterId: string;
    unlockedLevels: string[];
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
    const [gameMode, setGameMode] = useState<string>('MULTIPLAYER');
    const router = useRouter();

    const characterImageMap: Record<string, string> = {
        c1: '/lobby/black_char_lobby.png',
        c2: '/lobby/green_char_lobby.png',
        c3: '/lobby/red_char_lobby.png',
        c4: '/lobby/blue_char_lobby.png',
    };

    const modeList = ['MULTIPLAYER', 'LEVEL_1', 'LEVEL_2', 'LEVEL_3'];
    const modeDisplayMap: Record<string, string> = {
        MULTIPLAYER: 'Multiplayer',
        LEVEL_1: 'Level 1',
        LEVEL_2: 'Level 2',
        LEVEL_3: 'Level 3',
    };

    const isUnlocked = (mode: string): boolean => {
        if (mode === 'MULTIPLAYER') return true;
        if (mode === 'LEVEL_1') return true;
        if (mode === 'LEVEL_2') return wallet?.unlockedLevels.includes('LEVEL_1') ?? false;
        if (mode === 'LEVEL_3') return wallet?.unlockedLevels.includes('LEVEL_2') ?? false;
        return false;
    };

    useEffect(() => {
        const run = async () => {
            const socket = new SockJS('http://localhost:8081/ws');
            const stompClient = new Client({
                webSocketFactory: () => socket,
                onConnect: () => {
                    const storedId = localStorage.getItem('playerId');
                    if (storedId) {
                        stompClient.subscribe('/user/queue/lobby-init', (message: IMessage) => {
                            const initData = JSON.parse(message.body);
                            const lobbyId = initData.lobbyId;

                            stompClient.subscribe(`/topic/lobby/${lobbyId}`, (message: IMessage) => {
                                const data = JSON.parse(message.body);
                                if (data.type === 'LOBBY_CREATED' || data.type === 'LOBBY_UPDATED') {
                                    setLobby(data.lobby);
                                }
                            });
                        });

                        stompClient.publish({
                            destination: '/app/joinLobby',
                            body: JSON.stringify({ playerId: storedId }),
                        });
                    }
                },
            });

            stompClient.activate();
            setClient(stompClient);
        };

        run();

        return () => {
            client?.deactivate();
        };
    }, []);

    useEffect(() => {
        const id = localStorage.getItem('playerId');
        if (!id) {
            toast.error('Not logged in!');
            router.push('/login');
            return;
        }

        setPlayerId(id);

        fetch(`http://localhost:8081/api/players/${id}`)
            .then(res => res.json())
            .then(data => {
                setPlayerName(data.username);
                setWallet({
                    xp: data.wallet.xp,
                    coins: data.wallet.coins,
                    selectedCharacterId: data.wallet.selectedCharacterId,
                    unlockedLevels: data.wallet.unlockedLevels || [],
                });
            });
    }, []);


    const startGameSession = async () => {
        if (!playerId) return;

        try {
            const res = await fetch(
                `http://localhost:8081/api/game-session/start?playerId=${playerId}&mode=${gameMode}`,
                { method: 'POST' }
            );
            if (!res.ok) {
                toast.error('Error while Loading');
                return;
            }

            const data = await res.json();
            router.push(`/loading?playerId=${playerId}&sessionId=${data.sessionId}`);
        } catch (err) {
            console.error(err);
            toast.error('Server Error');
        }
    };

    const goToShop = () => {
        if (playerId && playerName && wallet) {
            localStorage.setItem('shopPlayerId', playerId);
            localStorage.setItem('shopPlayerName', playerName);
            localStorage.setItem('shopWallet', JSON.stringify(wallet));
            router.push('/shop');
        }
    };

    const me = useMemo(() => {
        if (!lobby || !playerId) return null;
        return lobby.players.find(p => p.playerId === playerId) ?? null;
    }, [lobby, playerId]);

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
                color: '#fff',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            <ToastContainer position="top-center" autoClose={3000} />

            <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                display: 'flex',
                gap: '1rem',
                backgroundColor: 'rgba(0,0,0,0.6)',
                padding: '12px 24px',
                borderRadius: '12px',
                fontSize: '1.3rem',
            }}>
                <div>👤 {playerName}</div>
                <div>⭐ XP: {wallet?.xp}</div>
                <div>💰 {wallet?.coins}</div>
            </div>

            <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.7rem',
            }}>
                {modeList.map(mode => {
                    const unlocked = isUnlocked(mode);
                    return (
                        <GameButton
                            key={mode}
                            label={modeDisplayMap[mode]}
                            onClick={unlocked ? () => setGameMode(mode) : undefined}
                            styleOverride={{
                                backgroundColor:
                                    gameMode === mode
                                        ? '#4CAF50'
                                        : unlocked
                                            ? '#2196F3'
                                            : '#555',
                                cursor: unlocked ? 'pointer' : 'not-allowed',
                                fontSize: '1.2rem',
                                height: '60px',
                                width: '180px',
                            }}
                        />
                    );
                })}
                <GameButton
                    label="PLAY"
                    onClick={startGameSession}
                    styleOverride={{
                        backgroundColor: '#4CAF50',
                        width: '180px',
                        height: '60px',
                        fontSize: '1.2rem',
                    }}
                />

            </div>

            <div style={{
                position: 'absolute',
                bottom: '60px',
                left: '60px',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
            }}>
                <GameButton
                    label="CHARACTERS"
                    onClick={() => router.push('/character')}
                    styleOverride={{
                        fontSize: '1.2rem',
                        width: '200px',
                        height: '60px',
                    }}
                />
                <GameButton
                    label="SHOP"
                    onClick={goToShop}
                    styleOverride={{
                        fontSize: '1.2rem',
                        width: '200px',
                        height: '60px',
                    }}
                />
            </div>

            {wallet?.selectedCharacterId && characterImageMap[wallet.selectedCharacterId] && (
                <img
                    src={characterImageMap[wallet.selectedCharacterId]}
                    alt="Character"
                    style={{
                        position: 'absolute',
                        bottom: '10px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '400px',
                        height: '500px',
                        objectFit: 'contain',
                        zIndex: 10,
                        filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.8))',
                    }}
                />
            )}
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
