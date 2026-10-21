package com.homevista.homevista.controller;

import com.homevista.homevista.entity.BlogPost;
import com.homevista.homevista.repository.BlogPostRepository;
import com.homevista.homevista.service.AdminKeyService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/blogs")
public class BlogController {

    private final BlogPostRepository repository;
    private final AdminKeyService adminKeyService;

    public BlogController(BlogPostRepository repository, AdminKeyService adminKeyService) {
        this.repository = repository;
        this.adminKeyService = adminKeyService;
    }

    private ResponseEntity<Map<String, String>> forbidden() {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("message", "Not allowed. Admin key is missing or wrong."));
    }

    // GET /api/blogs  ya  GET /api/blogs?category=Renting
    @GetMapping
    public List<BlogPost> getAll(@RequestParam(required = false) String category) {
        if (category != null && !category.isBlank()) {
            return repository.findByCategoryIgnoreCase(category.trim());
        }
        return repository.findAll();
    }

    // GET /api/blogs/1
    @GetMapping("/{id}")
    public ResponseEntity<BlogPost> getById(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    // POST /api/blogs  (sirf admin)
    @PostMapping
    public ResponseEntity<?> create(
            @RequestBody BlogPost post,
            @RequestHeader(value = "X-Admin-Key", required = false) String key) {

        if (!adminKeyService.isValid(key)) return forbidden();

        post.setId(null);
        return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(post));
    }

    // PUT /api/blogs/1  (sirf admin)
    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestBody BlogPost updated,
            @RequestHeader(value = "X-Admin-Key", required = false) String key) {

        if (!adminKeyService.isValid(key)) return forbidden();

        return repository.findById(id).map(existing -> {
            existing.setTitle(updated.getTitle());
            existing.setCategory(updated.getCategory());
            existing.setSummary(updated.getSummary());
            existing.setContent(updated.getContent());
            existing.setImageUrl(updated.getImageUrl());
            existing.setPublishedDate(updated.getPublishedDate());
            existing.setReadTime(updated.getReadTime());
            return ResponseEntity.ok((Object) repository.save(existing));
        }).orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Article not found")));
    }
}