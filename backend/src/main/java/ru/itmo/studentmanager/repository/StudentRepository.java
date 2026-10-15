package ru.itmo.studentmanager.repository;

import ru.itmo.studentmanager.dto.StudentRequestDto;
import ru.itmo.studentmanager.dto.StudentResponseDto;
import ru.itmo.studentmanager.dto.StudentUpdateDto;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface StudentRepository {
    List<StudentResponseDto> findAll(Map<String, String> filters);
    Optional<StudentResponseDto> findByIsu(String isuId);
    boolean existsByIsu(String isuId);
    StudentResponseDto save(StudentRequestDto dto);
    Optional<StudentResponseDto> update(String isuId, StudentUpdateDto dto);
    boolean delete(String isuId);
}
