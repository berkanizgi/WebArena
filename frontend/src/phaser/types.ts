export interface CharacterPositionDTO {
    playerId: string;
    x: number;
    y: number;
    direction: 'up' | 'down' | 'left' | 'right';
    rotation: number;
    skin: string;
    isMoving?: boolean;
}

export interface AttackEventDTO {
    playerId: string;
    playerX: number;
    playerY: number;
    dirX: number;
    dirY: number;
}
