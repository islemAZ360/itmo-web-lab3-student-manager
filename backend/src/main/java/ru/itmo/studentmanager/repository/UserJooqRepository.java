package ru.itmo.studentmanager.repository;

import org.jooq.DSLContext;
import org.jooq.Record;
import org.springframework.stereotype.Repository;
import ru.itmo.studentmanager.model.User;

import java.util.Optional;

import static org.jooq.impl.DSL.field;
import static org.jooq.impl.DSL.table;

@Repository
public class UserJooqRepository {

    private final DSLContext dsl;

    public UserJooqRepository(DSLContext dsl) {
        this.dsl = dsl;
    }

    private User mapRecord(Record r) {
        return new User(
                r.get("id", Long.class),
                r.get("username", String.class),
                r.get("email", String.class),
                r.get("password", String.class),
                r.get("role", String.class)
        );
    }

    public Optional<User> findByUsername(String username) {
        return dsl.select()
                .from(table("users"))
                .where(field("username").eq(username))
                .fetchOptional(this::mapRecord);
    }

    public Optional<User> findById(Long id) {
        return dsl.select()
                .from(table("users"))
                .where(field("id").eq(id))
                .fetchOptional(this::mapRecord);
    }

    public boolean existsByUsername(String username) {
        return dsl.fetchExists(
                dsl.selectOne().from(table("users")).where(field("username").eq(username))
        );
    }

    public boolean existsByEmail(String email) {
        return dsl.fetchExists(
                dsl.selectOne().from(table("users")).where(field("email").eq(email))
        );
    }

    public User save(String username, String email, String encodedPassword, String role) {
        dsl.insertInto(table("users"))
                .columns(
                        field("username"),
                        field("email"),
                        field("password"),
                        field("role")
                )
                .values(username, email, encodedPassword, role)
                .execute();

        return findByUsername(username).orElseThrow();
    }
}