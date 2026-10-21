package com.homevista.homevista.controller;

import com.homevista.homevista.entity.Agent;
import com.homevista.homevista.repository.AgentRepository;
import com.homevista.homevista.service.AdminKeyService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/agents")
public class AgentController {

    private final AgentRepository repository;
    private final AdminKeyService adminKeyService;

    public AgentController(AgentRepository repository, AdminKeyService adminKeyService) {
        this.repository = repository;
        this.adminKeyService = adminKeyService;
    }

    // GET /api/agents
    @GetMapping
    public List<Agent> getAll() {
        return repository.findAll();
    }

    // GET /api/agents/1
    @GetMapping("/{id}")
    public ResponseEntity<Agent> getById(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    // POST /api/agents  (sirf admin)
    @PostMapping
    public ResponseEntity<?> create(
            @RequestBody Agent agent,
            @RequestHeader(value = "X-Admin-Key", required = false) String key) {

        if (!adminKeyService.isValid(key)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Not allowed. Admin key is missing or wrong."));
        }

        agent.setId(null);
        return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(agent));
    }
}