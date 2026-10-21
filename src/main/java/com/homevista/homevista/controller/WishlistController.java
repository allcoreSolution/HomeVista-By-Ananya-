package com.homevista.homevista.controller;

import com.homevista.homevista.entity.Wishlist;
import com.homevista.homevista.repository.PropertyRepository;
import com.homevista.homevista.repository.WishlistRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistRepository wishlistRepository;
    private final PropertyRepository propertyRepository;

    public WishlistController(WishlistRepository wishlistRepository,
                              PropertyRepository propertyRepository) {
        this.wishlistRepository = wishlistRepository;
        this.propertyRepository = propertyRepository;
    }

    // Logged-in user ki email (session se), nahi to null
    private String currentEmail(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        return session == null ? null : (String) session.getAttribute("userEmail");
    }

    private ResponseEntity<Map<String, String>> loginRequired() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Please login first"));
    }

    // GET /api/wishlist  → meri wishlist ki properties
    @GetMapping
    public ResponseEntity<?> getWishlist(HttpServletRequest request) {
        String email = currentEmail(request);
        if (email == null) return loginRequired();

        List<Long> ids = wishlistRepository.findByUserEmail(email).stream()
                .map(Wishlist::getPropertyId).toList();
        return ResponseEntity.ok(propertyRepository.findAllById(ids));
    }

    // POST /api/wishlist/2  → wishlist mein add
    @PostMapping("/{propertyId}")
    public ResponseEntity<Map<String, String>> add(@PathVariable Long propertyId,
                                                   HttpServletRequest request) {
        String email = currentEmail(request);
        if (email == null) return loginRequired();

        if (!propertyRepository.existsById(propertyId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Property not found"));
        }
        if (wishlistRepository.existsByUserEmailAndPropertyId(email, propertyId)) {
            return ResponseEntity.ok(Map.of("message", "Already in wishlist"));
        }

        Wishlist item = new Wishlist();
        item.setUserEmail(email);
        item.setPropertyId(propertyId);
        wishlistRepository.save(item);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Added to wishlist"));
    }

    // DELETE /api/wishlist/2  → wishlist se hatana
    @DeleteMapping("/{propertyId}")
    public ResponseEntity<Map<String, String>> remove(@PathVariable Long propertyId,
                                                      HttpServletRequest request) {
        String email = currentEmail(request);
        if (email == null) return loginRequired();

        wishlistRepository.deleteByUserEmailAndPropertyId(email, propertyId);
        return ResponseEntity.ok(Map.of("message", "Removed from wishlist"));
    }
}