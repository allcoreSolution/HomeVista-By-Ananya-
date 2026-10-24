package com.homevista.homevista.controller;

import com.homevista.homevista.service.AdminKeyService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/admin-auth")
public class AdminAuthController {

    private static final int MAX_FAILS = 5;
    private static final long LOCK_MS = 5 * 60 * 1000L;

    private final AdminKeyService adminKeyService;

    // IP -> {galat koshishein, lock kab tak (ms)}
    private final Map<String, long[]> attempts = new ConcurrentHashMap<>();

    public AdminAuthController(AdminKeyService adminKeyService) {
        this.adminKeyService = adminKeyService;
    }

    // POST /api/admin-auth/login
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> req,
                                                     HttpServletRequest request) {

        String ip = request.getRemoteAddr();
        long now = System.currentTimeMillis();
        long[] state = attempts.computeIfAbsent(ip, k -> new long[]{0, 0});

        if (state[1] > now) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("message", "Too many wrong attempts. Try again in a few minutes."));
        }

        if (!adminKeyService.credentialsValid(req.get("username"), req.get("password"))) {
            state[0]++;
            if (state[0] >= MAX_FAILS) {
                state[0] = 0;
                state[1] = now + LOCK_MS;
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Wrong username or password."));
        }

        state[0] = 0;
        state[1] = 0;

        HttpSession session = request.getSession(true);
        request.changeSessionId();
        session.setAttribute(AdminKeyService.SESSION_FLAG, Boolean.TRUE);

        return ResponseEntity.ok(Map.of("message", "Login successful"));
    }

    // POST /api/admin-auth/logout
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.removeAttribute(AdminKeyService.SESSION_FLAG);
        }
        return ResponseEntity.ok(Map.of("message", "Logged out"));
    }

    // GET /api/admin-auth/me
    @GetMapping("/me")
    public ResponseEntity<Map<String, String>> me() {
        if (!adminKeyService.hasAdminSession()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Not logged in as admin"));
        }
        return ResponseEntity.ok(Map.of("message", "Admin"));
    }
}