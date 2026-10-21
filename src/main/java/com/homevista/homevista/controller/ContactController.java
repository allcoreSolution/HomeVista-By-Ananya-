package com.homevista.homevista.controller;

import com.homevista.homevista.entity.ContactMessage;
import com.homevista.homevista.repository.ContactMessageRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private final ContactMessageRepository repository;

    public ContactController(ContactMessageRepository repository) {
        this.repository = repository;
    }

    // POST /api/contact
    @PostMapping
    public ResponseEntity<Map<String, String>> send(@RequestBody Map<String, String> req) {
        String fullName = req.get("fullName");
        String email = req.get("email");
        String message = req.get("message");

        if (fullName == null || fullName.isBlank()
                || email == null || email.isBlank()
                || message == null || message.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Name, email and message are required"));
        }

        ContactMessage cm = new ContactMessage();
        cm.setFullName(fullName.trim());
        cm.setEmail(email.trim());
        cm.setPhone(req.get("phone"));
        cm.setSubject(req.get("subject"));
        cm.setMessage(message.trim());
        repository.save(cm);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Thank you! We will contact you soon."));
    }
}