package com.falcim.subscription;

import com.falcim.common.BaseEntity;
import com.falcim.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import java.time.Instant;

/**
 * Kullanıcı aboneliği (iskelet). Ödeme entegrasyonu sonraki adımda eklenecek;
 * şimdilik premium erişimini işaretlemek için kullanılır.
 */
@Entity
@Table(name = "subscriptions")
public class Subscription extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Plan plan = Plan.FREE;

    @Column(nullable = false, length = 20)
    private String status = "ACTIVE";

    @Column(name = "current_period_end")
    private Instant currentPeriodEnd;

    protected Subscription() {
    }

    public boolean isPremiumActive() {
        return plan.isPremium()
                && "ACTIVE".equals(status)
                && (currentPeriodEnd == null || currentPeriodEnd.isAfter(Instant.now()));
    }

    public Plan getPlan() {
        return plan;
    }

    public String getStatus() {
        return status;
    }

    public Instant getCurrentPeriodEnd() {
        return currentPeriodEnd;
    }
}
