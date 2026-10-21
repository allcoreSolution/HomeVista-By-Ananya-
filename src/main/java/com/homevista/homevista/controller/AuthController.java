package com.homevista.homevista.controller;

import com.homevista.homevista.entity.PasswordResetToken;
import com.homevista.homevista.entity.User;
import com.homevista.homevista.repository.PasswordResetTokenRepository;
import com.homevista.homevista.repository.UserRepository;
import com.homevista.homevista.service.MailService;
import com.homevista.homevista.service.PasswordUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final MailService mailService;

    public AuthController(UserRepository userRepository,
                          PasswordResetTokenRepository tokenRepository,
                          MailService mailService) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.mailService = mailService;
    }

    // POST /api/auth/signup
    @PostMapping("/signup")
    public ResponseEntity<Map<String, String>> signup(@RequestBody Map<String, String> req) {
        String name = req.get("name");
        String email = req.get("email");
        String phone = req.get("phone");
        String password = req.get("password");

        if (name == null || name.isBlank() || email == null || email.isBlank()
                || password == null || password.length() < 6) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Name, email and password (min 6 characters) are required"));
        }

        email = email.trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "This email is already registered"));
        }

        User user = new User();
        user.setName(name.trim());
        user.setEmail(email);
        user.setPhone(phone);
        user.setPassword(PasswordUtil.hash(password));
        userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Signup successful"));
    }

    // POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> req,
                                                     HttpServletRequest request) {
        String email = req.get("email");
        String password = req.get("password");

        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Email and password are required"));
        }

        var userOpt = userRepository.findByEmail(email.trim().toLowerCase());

        if (userOpt.isEmpty() || !PasswordUtil.matches(password, userOpt.get().getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid email or password"));
        }

        User user = userOpt.get();

        // Login session banao (naya session id, taaki purani id kaam na aaye)
        HttpSession session = request.getSession(true);
        request.changeSessionId();
        session.setAttribute("userEmail", user.getEmail());

        return ResponseEntity.ok(Map.of(
                "message", "Login successful",
                "name", user.getName(),
                "email", user.getEmail()));
    }

    // POST /api/auth/logout
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return ResponseEntity.ok(Map.of("message", "Logged out"));
    }

    // GET /api/auth/me  → abhi kaun logged in hai
    @GetMapping("/me")
    public ResponseEntity<Map<String, String>> me(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        String email = session == null ? null : (String) session.getAttribute("userEmail");

        if (email == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Not logged in"));
        }

        return userRepository.findByEmail(email)
                .map(u -> ResponseEntity.ok(Map.of("name", u.getName(), "email", u.getEmail())))
                .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Not logged in")));
    }

    // POST /api/auth/forgot-password
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody Map<String, String> req) {
        String email = req.get("email");

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Email is required"));
        }

        email = email.trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            tokenRepository.deleteByEmail(email);

            PasswordResetToken t = new PasswordResetToken();
            t.setEmail(email);
            t.setToken(UUID.randomUUID().toString());
            t.setExpiresAt(LocalDateTime.now().plusMinutes(15));
            tokenRepository.save(t);

            boolean sent = mailService.sendResetCode(email, t.getToken());

            // Email na jaye to development ke liye code terminal mein print hota hai
            if (!sent) {
                System.out.println(">>> PASSWORD RESET CODE for " + email + " : " + t.getToken());
            }
        }

        return ResponseEntity.ok(Map.of(
                "message", "If this email is registered, a reset code has been generated."));
    }

    // POST /api/auth/reset-password
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody Map<String, String> req) {
        String token = req.get("token");
        String newPassword = req.get("newPassword");

        if (token == null || token.isBlank() || newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Reset code and new password (min 6 characters) are required"));
        }

        var tokenOpt = tokenRepository.findByToken(token.trim());

        if (tokenOpt.isEmpty() || tokenOpt.get().getExpiresAt().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Invalid or expired reset code"));
        }

        var userOpt = userRepository.findByEmail(tokenOpt.get().getEmail());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Invalid or expired reset code"));
        }

        User user = userOpt.get();
        user.setPassword(PasswordUtil.hash(newPassword));
        userRepository.save(user);
        tokenRepository.delete(tokenOpt.get());

        return ResponseEntity.ok(Map.of("message", "Password updated. Please login."));
    }
}