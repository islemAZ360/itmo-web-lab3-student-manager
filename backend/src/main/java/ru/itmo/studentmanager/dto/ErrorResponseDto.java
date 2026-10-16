package ru.itmo.studentmanager.dto;

import java.time.Instant;

public record ErrorResponseDto(
    int status,
    Instant timestamp,
    String message,
    String error
) {}