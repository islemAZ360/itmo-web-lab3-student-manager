package ru.itmo.studentmanager.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

public record StudentRequestDto(
        @NotBlank(message = "ISU ID is required")
        @Pattern(regexp = "^\\d{6}$", message = "ISU ID must be exactly 6 digits")
        String isuId,

        @NotBlank(message = "Full name is required")
        @Size(max = 50, message = "Full name max length is 50")
        String fullName,

        @NotBlank(message = "Group is required")
        @Pattern(regexp = "^[A-Z]\\d{4}$", message = "Group format must be like P3278")
        String group,

        @NotNull(message = "Dormitory number is required")
        @Min(1) @Max(99)
        Integer dormitoryNumber,

        @NotNull(message = "Room is required")
        @Min(1) @Max(9999)
        Integer room,

        @NotNull(message = "Accommodation period is required")
        LocalDate accommodationPeriod,

        Boolean isInternational,

        @Size(max = 150, message = "Notes max length is 150")
        String notes
) {}
