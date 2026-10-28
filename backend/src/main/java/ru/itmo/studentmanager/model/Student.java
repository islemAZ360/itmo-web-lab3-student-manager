package ru.itmo.studentmanager.model;

import java.time.LocalDate;

public record Student(
        String isuId,
        String fullName,
        String studentGroup,
        Integer dormitoryNumber,
        Integer room,
        LocalDate accommodationPeriod,
        Boolean isInternational,
        String notes
) {}
