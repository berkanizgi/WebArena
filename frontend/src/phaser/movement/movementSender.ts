import { Client as StompClient } from '@stomp/stompjs';

export function sendMovement(
    stompClient: StompClient,
    characterId: string,
    x: number,
    y: number,
    direction: string,
    rotation: number,
    moveX: number,
    moveY: number
) {
    if (!stompClient || !stompClient.connected) return;
    if (moveX === 0 && moveY === 0) return;

    stompClient.publish({
        destination: '/app/move',
        body: JSON.stringify({ characterId, x, y, direction, rotation })
    });
}
