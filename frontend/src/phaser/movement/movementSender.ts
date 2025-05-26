import { Client as StompClient } from '@stomp/stompjs';

export function sendMovement(
    stompClient: StompClient,
    playerId: string,
    x: number,
    y: number,
    direction: string,
    rotation: number,
    moveX: number,
    moveY: number,
    skin: string
) {
    if (!stompClient || !stompClient.connected) return;

    const isMoving = moveX !== 0 || moveY !== 0;
    // Hier schicken wir auch Movement, selbst wenn Spieler stillsteht
    const payload = {
        playerId,
        x,
        y,
        direction,
        rotation,
        skin,
        isMoving
    };

    console.log('[sendMovement] Sende Movement:', payload);

    stompClient.publish({
        destination: '/app/move',
        body: JSON.stringify(payload)
    });
}
