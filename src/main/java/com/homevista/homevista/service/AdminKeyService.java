package com.homevista.homevista.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@Service
public class AdminKeyService {

    private final String adminKey;

    public AdminKeyService(@Value("${homevista.admin-key:}") String adminKey) {
        this.adminKey = adminKey;
    }

    // Key set na ho ya galat ho, to false
    public boolean isValid(String key) {
        if (adminKey == null || adminKey.isBlank() || key == null) return false;
        return MessageDigest.isEqual(
                adminKey.getBytes(StandardCharsets.UTF_8),
                key.getBytes(StandardCharsets.UTF_8));
    }
}