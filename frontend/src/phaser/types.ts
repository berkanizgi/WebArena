export interface CharacterPositionDTO {
    characterId: string;
    x: number;
    y: number;
    direction: 'up' | 'down' | 'left' | 'right';
    rotation: number;
}

export interface AttackEventDTO {
    playerId: string;
    playerX: number;
    playerY: number;
    dirX: number;
    dirY: number;
}
