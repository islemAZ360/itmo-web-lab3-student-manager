package ru.itmo.studentmanager.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

public record StudentUpdateDto(
        @Size(max = 50)
        String fullName,

        @Pattern(regexp = "^[A-Z]\\d{4}$", message = "Group format must be like P3278")
        String group,

        @Min(1) @Max(99)
        Integer dormitoryNumber,

        @Min(1) @Max(9999)
        Integer room,

        LocalDate accommodationPeriod,

        Boolean isInternational,

        @Size(max = 150)
        String notes
) {}
