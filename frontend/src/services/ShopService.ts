const BASE_URL = 'http://localhost:8083/api/shop';

export interface CharacterItem {
    id: number;
    name: string;
    priceCoins: number;
    priceShards: number;
    baseHealth: number;
    baseAttack: number;
    speed: number;
    rare: boolean; // <-- Boolean!
}

export type ShopItem = CharacterItem;

export async function fetchShopItems(rare?: boolean): Promise<ShopItem[]> {
    let url = `${BASE_URL}/items`;
    if (rare !== undefined) {
        url += `?rare=${rare}`; // rare=true oder rare=false in der URL
    }

    const response = await fetch(url, { cache: 'no-store' });

    if (!response.ok) {
        throw new Error('Failed to fetch shop items');
    }

    return response.json();
}