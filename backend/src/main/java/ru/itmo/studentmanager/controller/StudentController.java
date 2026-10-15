package ru.itmo.studentmanager.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.itmo.studentmanager.dto.StudentRequestDto;
import ru.itmo.studentmanager.dto.StudentResponseDto;
import ru.itmo.studentmanager.dto.StudentUpdateDto;
import ru.itmo.studentmanager.service.StudentService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*")
public class StudentController {

    private final StudentService service;

    public StudentController(StudentService service) {
        this.service = service;
    }

    @GetMapping
    public List<StudentResponseDto> getStudents(@RequestParam Map<String, String> params) {
        return service.getFilteredStudents(params);
    }

    @PostMapping("/search")
    public List<StudentResponseDto> queryStudents(@RequestBody(required = false) Map<String, String> filters) {
        return service.getFilteredStudents(filters);
    }

    @GetMapping("/{isuId}")
    public StudentResponseDto getStudent(@PathVariable String isuId) {
        return service.getStudentByIsu(isuId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public StudentResponseDto createStudent(@Valid @RequestBody StudentRequestDto dto) {
        return service.createStudent(dto);
    }

    @PatchMapping("/{isuId}")
    public StudentResponseDto patchStudent(@PathVariable String isuId, @Valid @RequestBody StudentUpdateDto dto) {
        return service.updateStudent(isuId, dto);
    }

    @PutMapping("/{isuId}")
    public StudentResponseDto putStudent(@PathVariable String isuId, @Valid @RequestBody StudentUpdateDto dto) {
        return service.updateStudent(isuId, dto);
    }

    @DeleteMapping("/{isuId}")
    public ResponseEntity<Void> deleteStudent(@PathVariable String isuId) {
        service.deleteStudent(isuId);
        return ResponseEntity.noContent().build();
    }
}
