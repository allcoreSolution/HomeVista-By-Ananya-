package com.homevista.homevista.controller;

import com.homevista.homevista.entity.Property;
import com.homevista.homevista.repository.PropertyRepository;
import com.homevista.homevista.service.AdminKeyService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/properties")
public class PropertyController {

    private final PropertyRepository repository;
    private final AdminKeyService adminKeyService;

    public PropertyController(PropertyRepository repository, AdminKeyService adminKeyService) {
        this.repository = repository;
        this.adminKeyService = adminKeyService;
    }

    private ResponseEntity<Map<String, String>> forbidden() {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("message", "Not allowed. Admin key is missing or wrong."));
    }

    private String clean(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }

    private String lower(String value) {
        return (value == null || value.isBlank()) ? null : value.trim().toLowerCase();
    }

    // GET /api/properties?type=buy&location=Pune&propertyType=villa&minPrice=1000000&maxPrice=6000000
    @GetMapping
    public List<Property> getAll(@RequestParam(required = false) String type,
                                 @RequestParam(required = false) String location,
                                 @RequestParam(required = false) String propertyType,
                                 @RequestParam(required = false) Double minPrice,
                                 @RequestParam(required = false) Double maxPrice) {
        return repository.search(clean(type), clean(location), clean(propertyType), minPrice, maxPrice);
    }

    // GET /api/properties/featured  (home page ke liye)
    @GetMapping("/featured")
    public List<Property> getFeatured() {
        List<Property> list = repository.findTop4ByFeaturedTrueOrderByIdDesc();
        return list.isEmpty() ? repository.findTop4ByOrderByIdDesc() : list;
    }

    // GET /api/properties/most-visited  (admin panel ke liye, top 5)
    @GetMapping("/most-visited")
    public List<Property> getMostVisited() {
        return repository.findTop5ByOrderByViewsDesc();
    }

    // GET /api/properties/1
    @GetMapping("/{id}")
    public ResponseEntity<Property> getById(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    // POST /api/properties/1/view  (property-details page khulne par views +1)
    @PostMapping("/{id}/view")
    public ResponseEntity<?> addView(@PathVariable Long id) {
        int rows = repository.incrementViews(id);
        if (rows == 0) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Property not found"));
        }
        return ResponseEntity.ok(Map.of("message", "ok"));
    }

    // POST /api/properties  (sirf admin)
    @PostMapping
    public ResponseEntity<?> create(
            @RequestBody Property property,
            @RequestHeader(value = "X-Admin-Key", required = false) String key) {

        if (!adminKeyService.isValid(key)) return forbidden();

        if (property.getTitle() == null || property.getTitle().isBlank()
                || property.getLocation() == null || property.getLocation().isBlank()
                || property.getType() == null || property.getType().isBlank()
                || property.getPrice() == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Title, location, type and price are required"));
        }

        property.setId(null);
        property.setViews(0L);
        property.setType(property.getType().trim().toLowerCase());
        property.setPropertyType(lower(property.getPropertyType()));
        if (property.getStatus() == null || property.getStatus().isBlank()) {
            property.setStatus("Active");
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(property));
    }

    // PUT /api/properties/1  (sirf admin)
    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestBody Property updated,
            @RequestHeader(value = "X-Admin-Key", required = false) String key) {

        if (!adminKeyService.isValid(key)) return forbidden();

        return repository.findById(id).map(existing -> {
            existing.setTitle(updated.getTitle());
            existing.setLocation(updated.getLocation());
            existing.setType(lower(updated.getType()));
            existing.setPropertyType(lower(updated.getPropertyType()));
            existing.setPrice(updated.getPrice());
            existing.setImageUrl(updated.getImageUrl());
            existing.setBhk(updated.getBhk());
            existing.setBath(updated.getBath());
            existing.setArea(updated.getArea());
            existing.setFurnished(updated.getFurnished());
            existing.setDescription(updated.getDescription());
            if (updated.getFeatured() != null) {
                existing.setFeatured(updated.getFeatured());
            }
            if (updated.getStatus() != null && !updated.getStatus().isBlank()) {
                existing.setStatus(updated.getStatus());
            }
            return ResponseEntity.ok((Object) repository.save(existing));
        }).orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Property not found")));
    }

    // DELETE /api/properties/1  (sirf admin)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(
            @PathVariable Long id,
            @RequestHeader(value = "X-Admin-Key", required = false) String key) {

        if (!adminKeyService.isValid(key)) return forbidden();

        repository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Property deleted"));
    }
}