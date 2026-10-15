package ru.itmo.studentmanager.service;

import org.springframework.stereotype.Service;
import ru.itmo.studentmanager.dto.StudentRequestDto;
import ru.itmo.studentmanager.dto.StudentResponseDto;
import ru.itmo.studentmanager.dto.StudentUpdateDto;
import ru.itmo.studentmanager.exception.DuplicateResourceException;
import ru.itmo.studentmanager.exception.ResourceNotFoundException;
import ru.itmo.studentmanager.repository.StudentRepository;

import java.util.List;
import java.util.Map;

@Service
public class StudentService {

    private final StudentRepository repo;

    public StudentService(StudentRepository repo) {
        this.repo = repo;
    }

    public List<StudentResponseDto> getFilteredStudents(Map<String, String> filters) {
        return repo.findAll(filters);
    }

    public StudentResponseDto getStudentByIsu(String isuId) {
        return repo.findByIsu(isuId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
    }

    public StudentResponseDto createStudent(StudentRequestDto dto) {
        if (repo.existsByIsu(dto.isuId())) {
            throw new DuplicateResourceException("Student with this ISU ID already exists");
        }
        return repo.save(dto);
    }

    public StudentResponseDto updateStudent(String isuId, StudentUpdateDto dto) {
        return repo.update(isuId, dto)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
    }

    public void deleteStudent(String isuId) {
        if (!repo.delete(isuId)) {
            throw new ResourceNotFoundException("Student not found");
        }
    }
}
