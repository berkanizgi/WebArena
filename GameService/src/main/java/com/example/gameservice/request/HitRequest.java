package com.example.gameservice.request;

public class HitRequest {
    private String shooterId;
    private String targetId;

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
}
