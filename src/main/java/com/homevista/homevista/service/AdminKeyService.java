package com.homevista.homevista.service;

import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@Service
public class AdminKeyService {

    public static final String SESSION_FLAG = "isAdmin";

    private final String adminUsername;
    private final String adminPassword;

    public AdminKeyService(@Value("${homevista.admin-username:}") String adminUsername,
                           @Value("${homevista.admin-password:}") String adminPassword) {
        this.adminUsername = adminUsername;
        this.adminPassword = adminPassword;
    }

    // Value set na ho (khali) ya galat ho, to false
    private boolean same(String expected, String given) {
        if (expected == null || expected.isBlank() || given == null) return false;
        return MessageDigest.isEqual(
                expected.getBytes(StandardCharsets.UTF_8),
                given.getBytes(StandardCharsets.UTF_8));
    }

    // Admin endpoints sirf admin login session maante hain.
    // "key" parameter purane controllers ke liye bacha hai, uska ab koi asar nahi.
    public boolean isValid(String key) {
        return hasAdminSession();
    }

    // Username + password sahi hain?
    public boolean credentialsValid(String username, String password) {
        boolean u = same(adminUsername, username);
        boolean p = same(adminPassword, password);
        return u && p;
    }

    public boolean hasAdminSession() {
        var attrs = RequestContextHolder.getRequestAttributes();
        if (!(attrs instanceof ServletRequestAttributes sra)) return false;
        HttpSession s = sra.getRequest().getSession(false);
        return s != null && Boolean.TRUE.equals(s.getAttribute(SESSION_FLAG));
    }
}