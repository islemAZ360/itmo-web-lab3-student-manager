package ru.itmo.studentmanager.dto;

import java.time.LocalDate;

public record StudentResponseDto(
        String isuId,
        String fullName,
        String group,
        Integer dormitoryNumber,
        Integer room,
        LocalDate accommodationPeriod,
        Boolean isInternational,
        String notes
) {}
