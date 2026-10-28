package ru.itmo.studentmanager.model;

import java.time.LocalDateTime;

public record RefreshToken(
        Long id,
        Long userId,
        String token,
        LocalDateTime expiryDate
) {}
