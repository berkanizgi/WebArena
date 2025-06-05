package com.example.gameservice.response;

public class LoginResponse {
    private boolean success;
    private String playerId;
    private String message;

    public LoginResponse(boolean success, String playerId, String message) {
        this.success = success;
        this.playerId = playerId;
        this.message = message;
    }

    // Getter
    public boolean isSuccess() {
        return success;
    }

    public String getPlayerId() {
        return playerId;
    }

    public String getMessage() {
        return message;
    }
}
