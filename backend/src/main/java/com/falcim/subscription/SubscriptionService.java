package com.falcim.subscription;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;

    public SubscriptionService(SubscriptionRepository subscriptionRepository) {
        this.subscriptionRepository = subscriptionRepository;
    }

    @Transactional(readOnly = true)
    public boolean isPremium(UUID userId) {
        return subscriptionRepository.findByUserId(userId)
                .map(Subscription::isPremiumActive)
                .orElse(false);
    }
}
