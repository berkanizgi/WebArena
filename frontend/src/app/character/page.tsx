'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface OwnedCharacter {
    characterId: string;
    baseHealth: number;
    baseAttack: number;
    baseSpeed: number;
    projectileSpeed: number;
    level: number;
    nextUpgradeCost: number;
}

interface BaseStat {
    characterId: string;
    baseHealth: number;
    baseAttack: number;
    baseSpeed: number;
    projectileSpeed: number;
}

interface Character {
    id: string;
    name: string;
    spriteSheetPath: string;
    spriteSheetSize: { width: number; height: number };
}

export default function CharacterOverview() {
    const [ownedCharacters, setOwnedCharacters] = useState<OwnedCharacter[]>([]);
    const [baseStats, setBaseStats] = useState<Record<string, BaseStat>>({});
    const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
    const [tempSelectedId, setTempSelectedId] = useState<string | null>(null);
    const router = useRouter();

    const characterData: Character[] = [
        { id: 'c1', name: 'Black Asha', spriteSheetPath: '/lobby/black_char_lobby.png', spriteSheetSize: { width: 256, height: 128 } },
        { id: 'c2', name: 'Green Asha', spriteSheetPath: '/lobby/green_char_lobby.png', spriteSheetSize: { width: 256, height: 128 } },
        { id: 'c3', name: 'Red Asha', spriteSheetPath: '/lobby/red_char_lobby.png', spriteSheetSize: { width: 256, height: 128 } },
        { id: 'c4', name: 'Blue Asha', spriteSheetPath: '/lobby/blue_char_lobby.png', spriteSheetSize: { width: 256, height: 128 } },
    ];

    useEffect(() => {
        const playerId = sessionStorage.getItem('playerId');
        if (!playerId) return;

        // Lade Owned Characters + Auswahl
        fetch(`http://localhost:8084/api/characters/${playerId}/character-overview`)
            .then(res => res.json())
            .then(data => {
                setSelectedCharacterId(data.selectedCharacterId);
                setTempSelectedId(data.selectedCharacterId);
                setOwnedCharacters(data.ownedCharacters);
            });

        // Lade Base Stats für alle Charaktere
        fetch(`http://localhost:8084/api/characters/all-base-stats`)
            .then(res => res.json())
            .then(data => {
                const mappedStats: Record<string, BaseStat> = {};
                data.forEach((c: any) => {
                    mappedStats[c.characterId] = {
                        characterId: c.characterId,
                        baseHealth: c.baseHealth,
                        baseAttack: c.baseAttack,
                        baseSpeed: c.baseSpeed,
                        projectileSpeed: c.projectileSpeed ?? 10,
                    };
                });
                setBaseStats(mappedStats);
            });
    }, []);

    const saveSelection = async () => {
        const playerId = sessionStorage.getItem('playerId');
        if (!playerId || !tempSelectedId) return;

        await fetch(`http://localhost:8084/api/characters/${playerId}/select-character`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ characterId: tempSelectedId }),
        });

        setSelectedCharacterId(tempSelectedId);
        toast.success('Character Change Successful');
    };

    const handleLevelUp = async () => {
        const playerId = sessionStorage.getItem('playerId');
        if (!playerId || !selectedCharacterId) return;

        try {
            const res = await fetch(`http://localhost:8084/api/characters/${playerId}/level-up/${selectedCharacterId}`, {
                method: 'POST',
            });

            if (res.ok) {
                toast.success('Character LVL UP Successful');
                const updated = await fetch(`http://localhost:8084/api/characters/${playerId}/character-overview`);
                const data = await updated.json();
                setOwnedCharacters(data.ownedCharacters);
            } else {
                const text = await res.text();
                toast.error('Level up failed: ' + text);
            }
        } catch (err) {
            console.error(err);
            toast.error('Error during Level Up');
        }
    };

    const getOwned = (id: string) => ownedCharacters.find(c => c.characterId === id);
    const getBase = (id: string) => baseStats[id];

    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            backgroundColor: '#111',
            backgroundImage: 'url("/lobby/Lobby_Frame.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            fontFamily: 'Bangers, cursive',
            padding: '2rem'
        }}>
            {/* Toast Container */}
            <ToastContainer position="top-center" autoClose={3000} />

            <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'white', textShadow: '2px 2px black' }}>
                Character Overview
            </h1>
            <p style={{ color: 'white', marginBottom: '2rem' }}>Hier werden deine Charaktere angezeigt.</p>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '2rem',
                width: '100%',
                maxWidth: '1000px',
            }}>
                {characterData.map((char) => {
                    const owned = getOwned(char.id);
                    const base = getBase(char.id);
                    const isUnlocked = !!owned;
                    const isSaved = selectedCharacterId === char.id;
                    const isTempSelected = tempSelectedId === char.id;

                    return (
                        <div
                            key={char.id}
                            onClick={isUnlocked ? () => setTempSelectedId(char.id) : undefined}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                borderRadius: 8,
                                padding: 10,
                                textAlign: 'center',
                                backgroundColor: '#222',
                                cursor: isUnlocked ? 'pointer' : 'default',
                                boxShadow: isSaved
                                    ? '0 0 10px 4px yellow'
                                    : isTempSelected
                                        ? '0 0 10px 4px #2196F3'
                                        : '0 0 10px #000',
                                border: isSaved
                                    ? '2px solid yellow'
                                    : isTempSelected
                                        ? '2px solid #2196F3'
                                        : 'none',
                                transition: 'all 0.3s ease-in-out',
                                minHeight: '320px',
                            }}
                        >
                            <div
                                style={{
                                    filter: isUnlocked ? 'none' : 'grayscale(100%) brightness(0.6)',
                                    transition: 'filter 0.3s ease-in-out',
                                    flexGrow: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <img
                                    src={char.spriteSheetPath}
                                    alt={char.name}
                                    style={{
                                        width: '80%',
                                        objectFit: 'contain',
                                        imageRendering: 'pixelated',
                                    }}
                                />
                            </div>

                            <div
                                style={{
                                    marginTop: 8,
                                    fontSize: '0.9rem',
                                    color: isUnlocked ? 'white' : '#aaa',
                                    filter: isUnlocked ? 'none' : 'grayscale(100%) brightness(0.6)',
                                }}
                            >
                                {owned ? (
                                    <>
                                        <div>⭐ Level: {owned.level}</div>
                                        <div>❤️ {owned.baseHealth}</div>
                                        <div>🗡️ {owned.baseAttack}</div>
                                        <div>💨 {owned.baseSpeed}</div>
                                        <div>🎯 {owned.projectileSpeed}</div>
                                        <div>💰 Next: {owned.nextUpgradeCost}</div>
                                    </>
                                ) : (
                                    <>
                                        <div>⭐ Level: 1</div>
                                        <div>❤️ {base?.baseHealth ?? '?'}</div>
                                        <div>🗡️ {base?.baseAttack ?? '?'}</div>
                                        <div>💨 {base?.baseSpeed ?? '?'}</div>
                                        <div>🎯 {base?.projectileSpeed ?? '?'}</div>
                                        <div>💰 Next: ???</div>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                <button onClick={saveSelection} style={buttonStyle}>Set Active</button>
                <button onClick={handleLevelUp} style={buttonStyle}>Level Up</button>
                <button onClick={() => router.push('/lobby')} style={buttonStyle}>Back to Lobby</button>
            </div>
        </div>
    );
}

const buttonStyle = {
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '10px',
    fontFamily: 'Bangers, cursive',
    fontSize: '1.1rem',
    cursor: 'pointer',
};
