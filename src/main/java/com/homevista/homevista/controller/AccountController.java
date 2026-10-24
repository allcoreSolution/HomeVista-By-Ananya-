package com.homevista.homevista.controller;

import com.homevista.homevista.entity.PropertyInquiry;
import com.homevista.homevista.entity.User;
import com.homevista.homevista.repository.PropertyInquiryRepository;
import com.homevista.homevista.repository.UserRepository;
import com.homevista.homevista.service.PasswordUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/account")
public class AccountController {

    private final UserRepository userRepository;
    private final PropertyInquiryRepository inquiryRepository;

    public AccountController(UserRepository userRepository,
                             PropertyInquiryRepository inquiryRepository) {
        this.userRepository = userRepository;
        this.inquiryRepository = inquiryRepository;
    }

    // Login session se user nikalo (nahi mila to empty)
    private Optional<User> currentUser(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        String email = session == null ? null : (String) session.getAttribute("userEmail");
        if (email == null) return Optional.empty();
        return userRepository.findByEmail(email);
    }

    private ResponseEntity<Map<String, String>> notLoggedIn() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Please login first"));
    }

    private Map<String, Object> profileOf(User u) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("name", u.getName());
        m.put("email", u.getEmail());
        m.put("phone", u.getPhone() == null ? "" : u.getPhone());
        return m;
    }

    // GET /api/account/profile
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(HttpServletRequest request) {
        var user = currentUser(request);
        if (user.isEmpty()) return notLoggedIn();
        return ResponseEntity.ok(profileOf(user.get()));
    }

    // PUT /api/account/profile  (naam aur phone; email badalna band)
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> req,
                                           HttpServletRequest request) {
        var user = currentUser(request);
        if (user.isEmpty()) return notLoggedIn();

        String name = req.get("name");
        if (name == null || name.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Name is required"));
        }

        User u = user.get();
        u.setName(name.trim());
        String phone = req.get("phone");
        u.setPhone(phone == null ? null : phone.trim());
        userRepository.save(u);

        return ResponseEntity.ok(profileOf(u));
    }

    // GET /api/account/enquiries  (is user ki apni enquiries)
    @GetMapping("/enquiries")
    public ResponseEntity<?> myEnquiries(HttpServletRequest request) {
        var user = currentUser(request);
        if (user.isEmpty()) return notLoggedIn();

        List<PropertyInquiry> list =
                inquiryRepository.findByUserEmailOrderByCreatedAtDesc(user.get().getEmail());
        return ResponseEntity.ok(list);
    }

    // POST /api/account/change-password
    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(@RequestBody Map<String, String> req,
                                                              HttpServletRequest request) {
        var user = currentUser(request);
        if (user.isEmpty()) return notLoggedIn();

        String current = req.get("currentPassword");
        String next = req.get("newPassword");

        if (current == null || next == null || next.length() < 6) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Current password and a new password (min 6 characters) are required"));
        }

        User u = user.get();

        if (!PasswordUtil.matches(current, u.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Current password is wrong"));
        }

        u.setPassword(PasswordUtil.hash(next));
        userRepository.save(u);

        return ResponseEntity.ok(Map.of("message", "Password changed"));
    }
}