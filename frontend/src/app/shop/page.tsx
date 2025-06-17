'use client';

import React, { useEffect, useState } from 'react';
import {
    fetchShopItems,
    fetchOwnedCharacters,
    buyCharacter,
    fetchWallet,
    CharacterItem,
} from '@/services/ShopService';

interface Wallet {
    xp: number;
    coins: number;
    selectedCharacterId: string;
}

const characterImageMap: Record<string, string> = {
    black_asha: '/lobby/black_char_lobby.png',
    green_asha: '/lobby/green_char_lobby.png',
    red_asha: '/lobby/red_char_lobby.png',
    blue_asha: '/lobby/blue_char_lobby.png',
};

const ShopPage = () => {
    const [shopItems, setShopItems] = useState<CharacterItem[]>([]);
    const [filteredItems, setFilteredItems] = useState<CharacterItem[]>([]);
    const [ownedCharacterIds, setOwnedCharacterIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [playerName, setPlayerName] = useState<string | null>(null);
    const [wallet, setWallet] = useState<Wallet | null>(null);
    const [playerId, setPlayerId] = useState<string | null>(null);

    useEffect(() => {
        const name = localStorage.getItem('shopPlayerName');
        const walletData = localStorage.getItem('shopWallet');
        const id = localStorage.getItem('shopPlayerId');
        if (name && walletData && id) {
            setPlayerName(name);
            setWallet(JSON.parse(walletData));
            setPlayerId(id);
            loadShopData(id);
        }
    }, []);

    const loadShopData = async (playerId: string) => {
        try {
            setLoading(true);
            const items = await fetchShopItems();
            const owned = await fetchOwnedCharacters(playerId);
            const freshWallet = await fetchWallet(playerId);
            setShopItems(items);
            setOwnedCharacterIds(owned);
            setFilteredItems(items);
            setWallet(freshWallet);
            localStorage.setItem('shopWallet', JSON.stringify(freshWallet));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleBuy = async (characterId: string) => {
        if (!playerId) return;
        try {
            await buyCharacter(playerId, characterId);
            alert('Purchase successful!');
            await loadShopData(playerId);
        } catch (err) {
            alert('Purchase failed: ' + err);
        }
    };

    const filterItems = (filter: 'all' | 'rare' | 'common') => {
        if (filter === 'rare') {
            setFilteredItems(shopItems.filter(item => item.rare));
        } else if (filter === 'common') {
            setFilteredItems(shopItems.filter(item => !item.rare));
        } else {
            setFilteredItems(shopItems);
        }
    };

    if (loading) return <div className="text-center mt-10 text-white">Loading shop items...</div>;
    if (error) return <div className="text-center text-red-500">Error: {error}</div>;

    const availableItems = filteredItems.filter(item => !ownedCharacterIds.includes(item.characterId));

    return (
        <div
            style={{
                width: '100vw',
                height: '100vh',
                backgroundImage: 'url("/lobby/Lobby_Frame.png")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                color: 'white',
                fontFamily: 'Bangers, cursive',
                overflowY: 'auto',
                padding: '40px',
                boxSizing: 'border-box',
            }}
        >
            {/* User Info oben links */}
            {playerName && wallet && (
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
                        fontSize: '1.3rem',
                        zIndex: 20,
                    }}
                >
                    <div>👤 {playerName}</div>
                    <div>⭐ XP: {wallet.xp}</div>
                    <div>💰 {wallet.coins}</div>
                </div>
            )}

            <h1 className="text-5xl text-center mb-10">SHOP</h1>

            {/* Filter Buttons */}
            <div className="flex justify-center gap-4 mb-10">
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded text-xl"
                    onClick={() => filterItems('all')}
                >
                    Alle
                </button>
                <button
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded text-xl"
                    onClick={() => filterItems('rare')}
                >
                    Rare
                </button>
                <button
                    className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded text-xl"
                    onClick={() => filterItems('common')}
                >
                    Common
                </button>
            </div>

            {/* Shop Grid */}
            <div className="grid grid-cols-3 gap-8 px-12">
                {availableItems.map((item) => (
                    <div
                        key={item.characterId}
                        className="border border-yellow-500 rounded-lg p-6 bg-black bg-opacity-60 shadow-xl hover:scale-105 transform transition relative"
                    >
                        <div className={`absolute top-2 right-2 px-3 py-1 text-xs font-bold rounded-full ${item.rare ? 'bg-yellow-400 text-black' : 'bg-gray-400 text-black'}`}>
                            {item.rare ? 'RARE' : 'COMMON'}
                        </div>

                        <div className="flex justify-center mb-4">
                            <img
                                src={characterImageMap[item.skin] || '/lobby/default.png'}
                                alt={item.name}
                                className="w-40 h-40 object-contain"
                            />
                        </div>

                        <h3 className="text-2xl font-bold text-center mb-2">{item.name}</h3>

                        <div className="flex flex-col gap-1 items-center text-lg">
                            <div className="flex items-center gap-2">
                                <span>💰</span>
                                <span>{item.priceCoins} Coins</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span>💎</span>
                                <span>{item.priceShards} Shards</span>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-center">
                            <button
                                onClick={() => handleBuy(item.characterId)}
                                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-6 rounded"
                            >
                                BUY
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ShopPage;
