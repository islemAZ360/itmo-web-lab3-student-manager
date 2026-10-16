package ru.itmo.studentmanager.model;

public record User(
        Long id,
        String username,
        String email,
        String password,
        String role
) {}