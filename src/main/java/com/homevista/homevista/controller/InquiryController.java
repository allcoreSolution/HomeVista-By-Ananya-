package com.homevista.homevista.controller;

import com.homevista.homevista.entity.PropertyInquiry;
import com.homevista.homevista.repository.PropertyInquiryRepository;
import com.homevista.homevista.repository.PropertyRepository;
import com.homevista.homevista.service.AdminKeyService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/inquiries")
public class InquiryController {

    private final PropertyInquiryRepository repository;
    private final PropertyRepository propertyRepository;
    private final AdminKeyService adminKeyService;

    public InquiryController(PropertyInquiryRepository repository,
                             PropertyRepository propertyRepository,
                             AdminKeyService adminKeyService) {
        this.repository = repository;
        this.propertyRepository = propertyRepository;
        this.adminKeyService = adminKeyService;
    }

    // POST /api/inquiries  (koi bhi enquiry bhej sakta hai)
    @PostMapping
    public ResponseEntity<Map<String, String>> create(@RequestBody Map<String, Object> req,
                                                      HttpServletRequest request) {
        String name = text(req.get("name"));
        String phone = text(req.get("phone"));
        String message = text(req.get("message"));
        String title = text(req.get("propertyTitle"));

        if (name.isBlank() || name.length() > 100) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Please enter your name (max 100 characters)"));
        }
        if (!phone.matches("[0-9+\\-\\s]{7,15}")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Please enter a valid phone number"));
        }
        if (message.length() > 1000) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Message is too long (max 1000 characters)"));
        }

        PropertyInquiry inquiry = new PropertyInquiry();
        inquiry.setName(name);
        inquiry.setPhone(phone);
        inquiry.setMessage(message);
        inquiry.setPropertyTitle(title.length() > 200 ? title.substring(0, 200) : title);

        // Property id sirf tab mano jab wo database mein sach mein ho
        Object pid = req.get("propertyId");
        if (pid != null) {
            try {
                Long id = Long.valueOf(pid.toString());
                if (propertyRepository.existsById(id)) {
                    inquiry.setPropertyId(id);
                }
            } catch (NumberFormatException ignored) {
            }
        }

        // Login hai to email session se lo
        HttpSession session = request.getSession(false);
        if (session != null) {
            inquiry.setUserEmail((String) session.getAttribute("userEmail"));
        }

        repository.save(inquiry);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Thank you! Our team will contact you soon."));
    }

    // GET /api/inquiries  (sirf admin, naye pehle)
    @GetMapping
    public ResponseEntity<?> getAll(
            @RequestHeader(value = "X-Admin-Key", required = false) String key) {

        if (!adminKeyService.isValid(key)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Not allowed. Admin key is missing or wrong."));
        }
        return ResponseEntity.ok(repository.findAllByOrderByCreatedAtDesc());
    }

    private String text(Object value) {
        return value == null ? "" : value.toString().trim();
    }
}