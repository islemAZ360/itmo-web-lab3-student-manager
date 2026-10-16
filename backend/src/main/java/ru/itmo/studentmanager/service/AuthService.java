package ru.itmo.studentmanager.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.studentmanager.dto.AuthResponseDto;
import ru.itmo.studentmanager.dto.LoginRequestDto;
import ru.itmo.studentmanager.dto.RefreshTokenRequestDto;
import ru.itmo.studentmanager.dto.RegisterRequestDto;
import ru.itmo.studentmanager.exception.DuplicateResourceException;
import ru.itmo.studentmanager.exception.InvalidCredentialsException;
import ru.itmo.studentmanager.model.User;
import ru.itmo.studentmanager.repository.RefreshTokenRepository;
import ru.itmo.studentmanager.repository.UserJooqRepository;
import ru.itmo.studentmanager.security.JwtTokenProvider;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserJooqRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(
            UserJooqRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider tokenProvider
    ) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public AuthResponseDto register(RegisterRequestDto dto) {
        if (userRepository.existsByUsername(dto.username())) {
            throw new DuplicateResourceException("Username already exists");
        }
        if (userRepository.existsByEmail(dto.email())) {
            throw new DuplicateResourceException("Email already registered");
        }

        String role = (dto.role() != null && !dto.role().isBlank()) ? dto.role() : "USER";
        String hashedPassword = passwordEncoder.encode(dto.password());

        User savedUser = userRepository.save(dto.username(), dto.email(), hashedPassword, role);
        log.info("Registered user: {}", savedUser.username());

        return issueTokens(savedUser);
    }

    @Transactional
    public AuthResponseDto login(LoginRequestDto dto) {
        User user = userRepository.findByUsername(dto.username())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid username or password"));

        if (!passwordEncoder.matches(dto.password(), user.password())) {
            throw new InvalidCredentialsException("Invalid username or password");
        }

        log.info("User logged in: {}", user.username());
        return issueTokens(user);
    }

    @Transactional
    public AuthResponseDto refresh(RefreshTokenRequestDto dto) {
        String token = dto.refreshToken();

        if (!tokenProvider.validateRefreshToken(token)) {
            throw new InvalidCredentialsException("Invalid or expired refresh token");
        }

        var tokenRecord = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new InvalidCredentialsException("Refresh token not found"));

        if (tokenRecord.expiryDate().isBefore(LocalDateTime.now())) {
            refreshTokenRepository.deleteByToken(token);
            throw new InvalidCredentialsException("Refresh token expired");
        }

        User user = userRepository.findById(tokenRecord.userId())
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));

        log.info("Refreshed token for user: {}", user.username());
        return issueTokens(user);
    }

    private AuthResponseDto issueTokens(User user) {
        String accessToken = tokenProvider.generateAccessToken(user.username(), user.role());
        String refreshToken = tokenProvider.generateRefreshToken(user.username());

        LocalDateTime expiry = LocalDateTime.now()
                .plus(Duration.ofMillis(tokenProvider.getRefreshExpirationMs()));
        refreshTokenRepository.save(user.id(), refreshToken, expiry);

        return new AuthResponseDto(accessToken, refreshToken, user.username(), user.role());
    }
}