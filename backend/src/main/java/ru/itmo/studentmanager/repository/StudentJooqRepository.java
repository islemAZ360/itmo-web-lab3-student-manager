package ru.itmo.studentmanager.repository;

import org.jooq.Condition;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.SortField;
import org.springframework.stereotype.Repository;
import ru.itmo.studentmanager.dto.StudentRequestDto;
import ru.itmo.studentmanager.dto.StudentResponseDto;
import ru.itmo.studentmanager.dto.StudentUpdateDto;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.jooq.impl.DSL.field;
import static org.jooq.impl.DSL.table;

@Repository
public class StudentJooqRepository implements StudentRepository {

    private final DSLContext dsl;

    public StudentJooqRepository(DSLContext dsl) {
        this.dsl = dsl;
    }

    private StudentResponseDto mapRecord(Record r) {
        return new StudentResponseDto(
                r.get("isu_id", String.class),
                r.get("full_name", String.class),
                r.get("student_group", String.class),
                r.get("dormitory_number", Integer.class),
                r.get("room", Integer.class),
                r.get("accommodation_period", LocalDate.class),
                r.get("is_international", Boolean.class),
                r.get("notes", String.class)
        );
    }

    @Override
    public List<StudentResponseDto> findAll(Map<String, String> filters) {
        List<Condition> conditions = new ArrayList<>();

        if (filters != null) {
            String name = filters.getOrDefault("fullName", filters.get("name"));
            String group = filters.get("group");
            String dormitory = filters.getOrDefault("dormitory", filters.get("dormitoryNumber"));
            String room = filters.get("room");
            String isuId = filters.getOrDefault("isuId", filters.get("isu"));

            if (name != null && !name.isBlank()) {
                conditions.add(field("full_name", String.class).containsIgnoreCase(name.trim()));
            }
            if (group != null && !group.isBlank()) {
                conditions.add(field("student_group", String.class).equalIgnoreCase(group.trim()));
            }
            if (dormitory != null && !dormitory.isBlank()) {
                conditions.add(field("dormitory_number", Integer.class).eq(Integer.parseInt(dormitory.trim())));
            }
            if (room != null && !room.isBlank()) {
                conditions.add(field("room", Integer.class).eq(Integer.parseInt(room.trim())));
            }
            if (isuId != null && !isuId.isBlank()) {
                conditions.add(field("isu_id", String.class).eq(isuId.trim()));
            }
        }

        String sortBy = filters != null ? filters.getOrDefault("sortBy", "isu_id") : "isu_id";
        String order = filters != null ? filters.getOrDefault("order", "asc") : "asc";
        SortField<?> sortField = "desc".equalsIgnoreCase(order)
                ? field(sortBy).desc()
                : field(sortBy).asc();

        int limit = filters != null && filters.containsKey("limit") ? Integer.parseInt(filters.get("limit")) : 100;
        int offset = filters != null && filters.containsKey("offset") ? Integer.parseInt(filters.get("offset")) : 0;

        return dsl.select()
                .from(table("students"))
                .where(conditions)
                .orderBy(sortField)
                .limit(limit)
                .offset(offset)
                .fetch(this::mapRecord);
    }

    @Override
    public Optional<StudentResponseDto> findByIsu(String isuId) {
        return dsl.select()
                .from(table("students"))
                .where(field("isu_id").eq(isuId))
                .fetchOptional(this::mapRecord);
    }

    @Override
    public boolean existsByIsu(String isuId) {
        return dsl.fetchExists(
                dsl.selectOne().from(table("students")).where(field("isu_id").eq(isuId))
        );
    }

    @Override
    public StudentResponseDto save(StudentRequestDto dto) {
        dsl.insertInto(table("students"))
                .columns(
                        field("isu_id"),
                        field("full_name"),
                        field("student_group"),
                        field("dormitory_number"),
                        field("room"),
                        field("accommodation_period"),
                        field("is_international"),
                        field("notes")
                )
                .values(
                        dto.isuId(),
                        dto.fullName(),
                        dto.group(),
                        dto.dormitoryNumber(),
                        dto.room(),
                        dto.accommodationPeriod(),
                        dto.isInternational() != null ? dto.isInternational() : false,
                        dto.notes()
                )
                .execute();

        return findByIsu(dto.isuId()).orElseThrow();
    }

    @Override
    public Optional<StudentResponseDto> update(String isuId, StudentUpdateDto dto) {
        var step = dsl.update(table("students"));
        var setStep = step.set(field("isu_id"), isuId);

        if (dto.fullName() != null) setStep = setStep.set(field("full_name"), dto.fullName());
        if (dto.group() != null) setStep = setStep.set(field("student_group"), dto.group());
        if (dto.dormitoryNumber() != null) setStep = setStep.set(field("dormitory_number"), dto.dormitoryNumber());
        if (dto.room() != null) setStep = setStep.set(field("room"), dto.room());
        if (dto.accommodationPeriod() != null) setStep = setStep.set(field("accommodation_period"), dto.accommodationPeriod());
        if (dto.isInternational() != null) setStep = setStep.set(field("is_international"), dto.isInternational());
        if (dto.notes() != null) setStep = setStep.set(field("notes"), dto.notes());

        int updated = setStep.where(field("isu_id").eq(isuId)).execute();
        if (updated == 0) {
            return Optional.empty();
        }
        return findByIsu(isuId);
    }

    @Override
    public boolean delete(String isuId) {
        int deleted = dsl.deleteFrom(table("students"))
                .where(field("isu_id").eq(isuId))
                .execute();
        return deleted > 0;
    }
}
