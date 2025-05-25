import { Client as StompClient } from '@stomp/stompjs';

export function sendMovement(
    stompClient: StompClient,
    characterId: string,
    x: number,
    y: number,
    direction: string,
    rotation: number,
    moveX: number,
    moveY: number,
    skin: string
) {
    if (!stompClient || !stompClient.connected) return;

    // Hier schicken wir auch Movement, selbst wenn Spieler stillsteht (z. B. beim Join wichtig)
    const payload = {
        characterId,
        x,
        y,
        direction,
        rotation,
        skin
    };

    console.log('[sendMovement] Sende Movement:', payload);

    stompClient.publish({
        destination: '/app/move',
        body: JSON.stringify(payload)
    });
}
