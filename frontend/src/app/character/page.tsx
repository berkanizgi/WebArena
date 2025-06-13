'use client';

import { useEffect, useState } from 'react';

interface OwnedCharacter {
    characterId: string;
    baseHealth: number;
    baseAttack: number;
    baseSpeed: number;
    projectileSpeed: number;
    level: number; // ← Wichtig
    nextUpgradeCost: number;
}
interface Character {
    id: string;
    name: string;
    spriteSheetPath: string;
    spriteSheetSize: { width: number; height: number };
}

export default function CharacterOverview() {
    const [ownedCharacters, setOwnedCharacters] = useState<OwnedCharacter[]>([]);
    const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
    const [tempSelectedId, setTempSelectedId] = useState<string | null>(null);

    const characterData: Character[] = [
        { id: 'c1', name: 'Black Asha', spriteSheetPath: '/lobby/black_char_lobby.png', spriteSheetSize: { width: 256, height: 128 } },
        { id: 'c2', name: 'Green Asha', spriteSheetPath: '/lobby/green_char_lobby.png', spriteSheetSize: { width: 256, height: 128 } },
        { id: 'c3', name: 'Red Asha', spriteSheetPath: '/lobby/red_char_lobby.png', spriteSheetSize: { width: 256, height: 128 } },
        { id: 'c4', name: 'Blue Asha', spriteSheetPath: '/lobby/blue_char_lobby.png', spriteSheetSize: { width: 256, height: 128 } },
    ];

    useEffect(() => {
        const playerId = localStorage.getItem('playerId');
        if (!playerId) return;

        fetch(`http://localhost:8084/api/characters/${playerId}/character-overview`)
            .then(res => res.json())
            .then(data => {
                setSelectedCharacterId(data.selectedCharacterId);
                setTempSelectedId(data.selectedCharacterId);
                setOwnedCharacters(data.ownedCharacters); // ✅ KORREKT
            });
    }, []);


    const saveSelection = async () => {
        const playerId = localStorage.getItem('playerId');
        if (!playerId || !tempSelectedId) return;

        await fetch(`http://localhost:8081/api/players/${playerId}/character`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ characterId: tempSelectedId }),
        });

        setSelectedCharacterId(tempSelectedId);
        alert('Auswahl gespeichert!');
    };


    const handleLevelUp = async () => {
        const playerId = localStorage.getItem('playerId');
        if (!playerId || !selectedCharacterId) return;

        try {
            const res = await fetch(`http://localhost:8084/api/characters/${playerId}/level-up/${selectedCharacterId}`, {
                method: 'POST',
            });

            if (res.ok) {
                alert("Level up erfolgreich!");
                // neu laden
                const updated = await fetch(`http://localhost:8084/api/characters/${playerId}/character-overview`);
                const data = await updated.json();
                setOwnedCharacters(data.ownedCharacters);
            } else {
                const text = await res.text();
                alert("Level up fehlgeschlagen: " + text);
            }
        } catch (err) {
            console.error(err);
            alert("Fehler beim Leveln");
        }
    };

    const getStatsForCharacter = (id: string) =>
        Array.isArray(ownedCharacters)
            ? ownedCharacters.find(c => c.characterId === id)
            : undefined;




    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100vw',
            height: '100vh',
            backgroundColor: '#111',
        }}>
            <div style={{
                width: '960px',
                height: '640px',
                display: 'flex',
                flexDirection: 'column',
                backgroundImage: 'url("/lobby/Lobby_Frame.png")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                fontFamily: 'Bangers, cursive',
                color: '#fff',
                boxSizing: 'border-box',
                padding: '20px',
            }}>
                <div style={{ marginBottom: '20px' }}>
                    <h1>Character Overview</h1>
                    <p>Hier werden deine Charaktere angezeigt.</p>
                </div>

                <div style={{
                    flexGrow: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 150px)',
                        rowGap: '64px',
                        columnGap: '80px',
                        justifyItems: 'center',
                    }}>
                        {characterData.map((char) => {
                            const owned = getStatsForCharacter(char.id);
                            const isUnlocked = !!owned;
                            const isSaved = selectedCharacterId === char.id;
                            const isTempSelected = tempSelectedId === char.id;

                            return (
                                <div
                                    key={char.id}
                                    onClick={isUnlocked ? () => setTempSelectedId(char.id) : undefined}
                                    style={{
                                        width: 150,
                                        borderRadius: 8,
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
                                        backgroundColor: '#222',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        padding: 10,
                                        cursor: isUnlocked ? 'pointer' : 'default',
                                    }}
                                >
                                    <img
                                        src={char.spriteSheetPath}
                                        alt={char.name}
                                        style={{
                                            width: 120,
                                            height: 120,
                                            objectFit: 'contain',
                                            imageRendering: 'pixelated',
                                            filter: isUnlocked ? 'none' : 'grayscale(100%)',
                                            opacity: isUnlocked ? 1 : 0.5,
                                        }}
                                    />
                                    {isUnlocked && owned && (
                                        <div style={{marginTop: 8, fontSize: '0.8rem', textAlign: 'center'}}>
                                            <div>⭐ Level: {owned.level ?? '-'}</div>
                                            <div>❤️ {owned.baseHealth}</div>
                                            <div>🗡️ {owned.baseAttack}</div>
                                            <div>💨 {owned.baseSpeed}</div>
                                            <div>🎯 {owned.projectileSpeed}</div>
                                            <div>💰 Next: {owned.nextUpgradeCost ?? '-'} Coins</div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div style={{marginTop: '30px', display: 'flex', justifyContent: 'center', gap: '1rem'}}>
                    <button
                        onClick={saveSelection}
                        disabled={!tempSelectedId}
                        style={{
                            backgroundColor: '#2196F3',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '10px',
                            fontFamily: 'Bangers, cursive',
                            fontSize: '1.1rem',
                            cursor: 'pointer',
                        }}
                    >
                        Auswahl speichern
                    </button>
                    <button
                        onClick={handleLevelUp}
                        disabled={!selectedCharacterId}
                        style={{
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '10px',
                            fontFamily: 'Bangers, cursive',
                            fontSize: '1.1rem',
                            cursor: selectedCharacterId ? 'pointer' : 'not-allowed',
                        }}
                    >
                        Level Up
                    </button>
                    <button
                        onClick={() => window.location.href = '/lobby'}
                        style={{
                            backgroundColor: '#555',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '10px',
                            fontFamily: 'Bangers, cursive',
                            fontSize: '1.1rem',
                            cursor: 'pointer',
                        }}
                    >
                        Zurück zur Lobby
                    </button>
                </div>
            </div>
        </div>
    );
}
