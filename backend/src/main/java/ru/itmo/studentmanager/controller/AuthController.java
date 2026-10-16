package ru.itmo.studentmanager.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import ru.itmo.studentmanager.dto.AuthResponseDto;
import ru.itmo.studentmanager.dto.LoginRequestDto;
import ru.itmo.studentmanager.dto.RefreshTokenRequestDto;
import ru.itmo.studentmanager.dto.RegisterRequestDto;
import ru.itmo.studentmanager.service.AuthService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponseDto register(@Valid @RequestBody RegisterRequestDto dto) {
        return authService.register(dto);
    }

    @PostMapping("/login")
    public AuthResponseDto login(@Valid @RequestBody LoginRequestDto dto) {
        return authService.login(dto);
    }

    @PostMapping("/refresh")
    public AuthResponseDto refresh(@Valid @RequestBody RefreshTokenRequestDto dto) {
        return authService.refresh(dto);
    }
}