// src/services/ShopService.ts

const BASE_URL = 'http://localhost:8083/api/shop';

export interface CharacterItem {
    id: number;
    name: string;
    priceCoins: number;
    priceShards: number;
    category: string;
    baseHp: number;
    baseAttack: number;
    baseSpeed: number;
}

export interface UpgradeItem {
    id: number;
    name: string;
    priceCoins: number;
    priceShards: number;
    category: string;
    bonusType: string;
    bonusValue: number;
}

export type ShopItem = CharacterItem | UpgradeItem;

export async function fetchShopItems(category?: string): Promise<ShopItem[]> {
    let url = `${BASE_URL}/items`;
    if (category) {
        url += `?category=${category}`;
    }

    const response = await fetch(url, { cache: 'no-store' });

    if (!response.ok) {
        throw new Error('Failed to fetch shop items');
    }

    return response.json();
}
