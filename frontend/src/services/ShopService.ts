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

export async function fetchOwnedCharacters(playerId: string) {
    const response = await fetch(`http://localhost:8081/api/characters/${playerId}/owned-characters`);
    if (!response.ok) {
        throw new Error('Failed to fetch owned characters');
    }
    return response.json(); // Erwartet: Array von characterId Strings
}

export async function buyCharacter(playerId: string, characterId: string) {
    const response = await fetch('http://localhost:8083/api/shop/purchase', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerId, characterId }),
    });

    if (!response.ok) {
        throw new Error('Purchase failed');
    }
}