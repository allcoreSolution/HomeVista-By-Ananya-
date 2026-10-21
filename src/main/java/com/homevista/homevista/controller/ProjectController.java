package com.homevista.homevista.controller;

import com.homevista.homevista.entity.Project;
import com.homevista.homevista.repository.ProjectRepository;
import com.homevista.homevista.service.AdminKeyService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectRepository repository;
    private final AdminKeyService adminKeyService;

    public ProjectController(ProjectRepository repository, AdminKeyService adminKeyService) {
        this.repository = repository;
        this.adminKeyService = adminKeyService;
    }

    // GET /api/projects
    @GetMapping
    public List<Project> getAll() {
        return repository.findAll();
    }

    // GET /api/projects/1
    @GetMapping("/{id}")
    public ResponseEntity<Project> getById(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    // POST /api/projects  (sirf admin)
    @PostMapping
    public ResponseEntity<?> create(
            @RequestBody Project project,
            @RequestHeader(value = "X-Admin-Key", required = false) String key) {

        if (!adminKeyService.isValid(key)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Not allowed. Admin key is missing or wrong."));
        }

        project.setId(null);
        return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(project));
    }
}