package com.example.gameservice.request;

public class HitRequest {
    private String shooterId;
    private String targetId;
    private String sessionId;

    public HitRequest() {}

    public HitRequest(String shooterId, String targetId) {
        this.shooterId = shooterId;
        this.targetId = targetId;
    }

    public String getShooterId() {
        return shooterId;
    }

    public void setShooterId(String shooterId) {
        this.shooterId = shooterId;
    }

    public String getTargetId() {
        return targetId;
    }

    public void setTargetId(String targetId) {
        this.targetId = targetId;
    }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }
}
