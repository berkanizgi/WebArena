import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export function createZoneStompClient(): Client {
    const socket = new SockJS('http://localhost:8080/ws'); // MapService!
    return new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,
        debug: (str) => console.log('[ZoneStomp]', str),
    });
}
