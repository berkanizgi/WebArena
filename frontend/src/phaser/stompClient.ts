import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

export function createStompClient(url: string): Client {
    const client = new Client({
        webSocketFactory: () => new SockJS(url),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
    });
    return client;
}
