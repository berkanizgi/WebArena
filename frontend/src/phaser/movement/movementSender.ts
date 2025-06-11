import { Client as StompClient } from '@stomp/stompjs';

const skinMap: Record<string, string> = {
    c1: 'green_asha',
    c2: 'red_asha',
    c3: 'black_asha',
    c4: 'blue_asha'
};
export function sendMovement(
    stompClient: StompClient,
    playerId: string,
    x: number,
    y: number,
    direction: string,
    rotation: number,
    moveX: number,
    moveY: number,
    characterId: string,
    sessionId: string
) {
    if (!stompClient || !stompClient.connected) return;

    const isMoving = moveX !== 0 || moveY !== 0;

    const payload = {
        playerId,
        x,
        y,
        direction,
        rotation,
        characterId,
        isMoving,
        sessionId
    };

    stompClient.publish({
        destination: '/app/move',
        body: JSON.stringify(payload)
    });
}

