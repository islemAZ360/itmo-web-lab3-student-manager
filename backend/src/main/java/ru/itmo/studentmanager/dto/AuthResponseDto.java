package ru.itmo.studentmanager.dto;

public record AuthResponseDto(
    String accessToken,
    String refreshToken,
    String username,
    String role
) {}