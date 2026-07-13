package com.falcim.subscription;

public enum Plan {
    FREE,
    MONTHLY,
    YEARLY;

    public boolean isPremium() {
        return this != FREE;
    }
}
