package com.example.gameservice.config;

import com.example.gameservice.controller.LobbyWebSocketHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer, WebSocketConfigurer {

    private final LobbyWebSocketHandler lobbyWebSocketHandler;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");// Clients abonnieren unter /topic sozusagen
        config.setApplicationDestinationPrefixes("/app"); // Clients senden hierher
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws").setAllowedOriginPatterns("*").withSockJS();
    }



    @Autowired
    public WebSocketConfig(LobbyWebSocketHandler lobbyWebSocketHandler) {
        this.lobbyWebSocketHandler = lobbyWebSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(lobbyWebSocketHandler, "/ws/lobby").setAllowedOrigins("*");
    }
}
