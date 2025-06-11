import { Client as StompClient } from '@stomp/stompjs';

export interface AttackPayload {
    sessionId: string;
    playerId: string;
    playerX: number;
    playerY: number;
    dirX: number;
    dirY: number;
}

export function sendAttack(stompClient: StompClient, payload: AttackPayload) {
    stompClient.publish({
        destination: '/app/attack',
        body: JSON.stringify(payload)
    });
}
