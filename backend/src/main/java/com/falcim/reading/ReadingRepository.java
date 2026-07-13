package com.falcim.reading;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface ReadingRepository extends JpaRepository<Reading, UUID> {

    Page<Reading> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    Optional<Reading> findByIdAndUserId(UUID id, UUID userId);

    long countByUserIdAndCreatedAtBetween(UUID userId, Instant start, Instant end);
}
