package com.homevista.homevista.controller;

import com.homevista.homevista.entity.Property;
import com.homevista.homevista.repository.PropertyRepository;
import com.homevista.homevista.repository.UserRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;

    public PublicController(PropertyRepository propertyRepository, UserRepository userRepository) {
        this.propertyRepository = propertyRepository;
        this.userRepository = userRepository;
    }

    // GET /api/public/summary  (sirf gintiyan, login page ki stats bar ke liye)
    @GetMapping("/summary")
    public Map<String, Object> summary() {

        // "Gomti Nagar, Lucknow" mein se aakhri hissa (shehar) ginte hain
        Set<String> cities = new HashSet<>();
        for (Property p : propertyRepository.findAll()) {
            String loc = p.getLocation();
            if (loc == null || loc.isBlank()) continue;
            String[] parts = loc.split(",");
            cities.add(parts[parts.length - 1].trim().toLowerCase());
        }

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("properties", propertyRepository.count());
        out.put("users", userRepository.count());
        out.put("cities", cities.size());
        return out;
    }
}