package ru.itmo.studentmanager.repository;

import org.jooq.DSLContext;
import org.jooq.Record;
import org.springframework.stereotype.Repository;
import ru.itmo.studentmanager.model.RefreshToken;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.jooq.impl.DSL.field;
import static org.jooq.impl.DSL.table;

@Repository
public class RefreshTokenRepository {

    private final DSLContext dsl;

    public RefreshTokenRepository(DSLContext dsl) {
        this.dsl = dsl;
    }

    private RefreshToken mapRecord(Record r) {
        return new RefreshToken(
                r.get("id", Long.class),
                r.get("user_id", Long.class),
                r.get("token", String.class),
                r.get("expiry_date", LocalDateTime.class)
        );
    }

    public void save(Long userId, String token, LocalDateTime expiryDate) {
        deleteByUserId(userId);

        dsl.insertInto(table("refresh_tokens"))
                .columns(field("user_id"), field("token"), field("expiry_date"))
                .values(userId, token, expiryDate)
                .execute();
    }

    public Optional<RefreshToken> findByToken(String token) {
        return dsl.select()
                .from(table("refresh_tokens"))
                .where(field("token", String.class).eq(token))
                .fetchOptional(this::mapRecord);
    }

    public void deleteByUserId(Long userId) {
        dsl.deleteFrom(table("refresh_tokens"))
                .where(field("user_id", Long.class).eq(userId))
                .execute();
    }

    public void deleteByToken(String token) {
        dsl.deleteFrom(table("refresh_tokens"))
                .where(field("token", String.class).eq(token))
                .execute();
    }
}