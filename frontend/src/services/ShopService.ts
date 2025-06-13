const BASE_URL = 'http://localhost:8083/api/shop';

export interface CharacterItem {
    characterId: string;
    name: string;
    skin: string;
    baseHealth: number;
    baseAttack: number;
    speed: number;
    role: string;
    description: string;
    rare: boolean;
    priceCoins: number;
    priceShards: number;
}

// Wandelt Backend-Response in CharacterItem
function mapToCharacterItem(item: any): CharacterItem {
    return {
        characterId: item.characterId ?? item.id?.toString(), // Akzeptiert beide!
        name: item.name,
        skin: item.skin,
        baseHealth: item.baseHealth,
        baseAttack: item.baseAttack,
        speed: item.speed,
        role: item.role,
        description: item.description,
        rare: item.rare,
        priceCoins: item.priceCoins,
        priceShards: item.priceShards,
    };
}

export async function fetchShopItems(): Promise<CharacterItem[]> {
    const response = await fetch(`${BASE_URL}/items`, { cache: 'no-store' });
    if (!response.ok) {
        throw new Error('Failed to fetch shop items');
    }
    const raw = await response.json();
    return raw.map(mapToCharacterItem);
}

export async function fetchOwnedCharacters(playerId: string) {
    const response = await fetch(`http://localhost:8084/api/characters/${playerId}/owned-characters`);
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

export async function fetchWallet(playerId: string): Promise<any> {
    const response = await fetch(`http://localhost:8081/api/purchase/wallet/${playerId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch wallet');
    }
    return response.json();
}
