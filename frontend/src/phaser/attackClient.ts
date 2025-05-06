import { Client as StompClient } from '@stomp/stompjs';

export interface AttackPayload {
    playerId: string;
    x: number;
    y: number;
    playerX: number;
    playerY: number;
}

export function sendAttack(stompClient: StompClient, payload: AttackPayload) {
    stompClient.publish({
        destination: '/app/attack',
        body: JSON.stringify(payload)
    });
}
