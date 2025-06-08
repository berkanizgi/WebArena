'use client';

import React, { useEffect, useState } from 'react';
import { fetchShopItems, ShopItem } from '@/services/ShopService';

const ShopPage = () => {
    const [shopItems, setShopItems] = useState<ShopItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadItems = async (rare?: boolean) => {
        try {
            setLoading(true);
            const items = await fetchShopItems(rare);
            setShopItems(items);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadItems(); // Initial: Alle laden
    }, []);

    if (loading) return <div className="text-center mt-10">Loading shop items...</div>;
    if (error) return <div className="text-center text-red-500">Error: {error}</div>;

    return (
        <div className="p-8 bg-gray-900 min-h-screen text-white">
            <h1 className="text-4xl mb-8 text-center">Shop</h1>

            {/* Kategorien-Buttons */}
            <div className="flex justify-center gap-4 mb-8">
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => loadItems()}
                >
                    Alle
                </button>
                <button
                    className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => loadItems(true)}
                >
                    Rare Characters
                </button>
                <button
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => loadItems(false)}
                >
                    Normal Characters
                </button>
            </div>

            {/* Items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {shopItems.map((item) => (
                    <div
                        key={item.id}
                        className={`border ${item.rare ? 'border-yellow-400' : 'border-gray-700'} rounded-lg p-6 shadow-lg bg-gray-800 hover:scale-105 transform transition`}
                    >
                        <h3 className="text-2xl font-bold mb-4">{item.name}</h3>
                        <p><strong>Coins:</strong> {item.priceCoins}</p>
                        <p><strong>Shards:</strong> {item.priceShards}</p>
                        <p><strong>Rare:</strong> {item.rare ? 'Yes' : 'No'}</p>
                        <div className="mt-4">
                            <p><strong>HP:</strong> {item.baseHealth}</p>
                            <p><strong>Attack:</strong> {item.baseAttack}</p>
                            <p><strong>Speed:</strong> {item.speed}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ShopPage;
