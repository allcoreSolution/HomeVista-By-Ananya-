package com.homevista.homevista.controller;

import com.homevista.homevista.entity.Property;
import com.homevista.homevista.repository.ContactMessageRepository;
import com.homevista.homevista.repository.PropertyInquiryRepository;
import com.homevista.homevista.repository.PropertyRepository;
import com.homevista.homevista.repository.UserRepository;
import com.homevista.homevista.repository.WishlistRepository;
import com.homevista.homevista.service.AdminKeyService;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminKeyService adminKeyService;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final PropertyInquiryRepository inquiryRepository;
    private final ContactMessageRepository contactRepository;
    private final WishlistRepository wishlistRepository;

    public AdminController(AdminKeyService adminKeyService,
                           PropertyRepository propertyRepository,
                           UserRepository userRepository,
                           PropertyInquiryRepository inquiryRepository,
                           ContactMessageRepository contactRepository,
                           WishlistRepository wishlistRepository) {
        this.adminKeyService = adminKeyService;
        this.propertyRepository = propertyRepository;
        this.userRepository = userRepository;
        this.inquiryRepository = inquiryRepository;
        this.contactRepository = contactRepository;
        this.wishlistRepository = wishlistRepository;
    }

    private ResponseEntity<Map<String, String>> forbidden() {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("message", "Not allowed. Admin key is missing or wrong."));
    }

    // Dates ki list se: is mahine kitne naye, pichhle mahine kitne naye
    // (jinki date null hai, yaani purani rows, unhe ginte nahi)
    private Map<String, Long> monthly(List<LocalDateTime> dates) {

        LocalDateTime thisStart = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime lastStart = thisStart.minusMonths(1);

        long thisMonth = 0;
        long lastMonth = 0;

        for (LocalDateTime d : dates) {
            if (d == null) continue;
            if (!d.isBefore(thisStart)) thisMonth++;
            else if (!d.isBefore(lastStart)) lastMonth++;
        }

        Map<String, Long> m = new LinkedHashMap<>();
        m.put("thisMonth", thisMonth);
        m.put("lastMonth", lastMonth);
        return m;
    }

    // GET /api/admin/stats  (sirf admin)
    @GetMapping("/stats")
    public ResponseEntity<?> stats(
            @RequestHeader(value = "X-Admin-Key", required = false) String key) {

        if (!adminKeyService.isValid(key)) return forbidden();

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("properties", propertyRepository.count());
        out.put("users", userRepository.count());
        out.put("enquiries", inquiryRepository.count());
        out.put("contactMessages", contactRepository.count());
        out.put("wishlistSaves", wishlistRepository.count());

        Map<String, Long> byType = new LinkedHashMap<>();
        byType.put("buy", propertyRepository.countByTypeIgnoreCase("buy"));
        byType.put("rent", propertyRepository.countByTypeIgnoreCase("rent"));
        byType.put("commercial", propertyRepository.countByTypeIgnoreCase("commercial"));
        out.put("byType", byType);

        // Monthly trends (abhi sirf properties aur users)
        Map<String, Object> trends = new LinkedHashMap<>();
        trends.put("properties", monthly(
                propertyRepository.findAll().stream().map(p -> p.getCreatedAt()).toList()));
               trends.put("users", monthly(
                userRepository.findAll().stream().map(u -> u.getCreatedAt()).toList()));
        trends.put("enquiries", monthly(
                inquiryRepository.findAll().stream().map(q -> q.getCreatedAt()).toList()));
        trends.put("messages", monthly(
                contactRepository.findAll().stream().map(m -> m.getCreatedAt()).toList()));
        out.put("trends", trends);

        // Sabse zyada wishlist hui top 5 properties
        List<Map<String, Object>> top = new ArrayList<>();
        for (Object[] row : wishlistRepository.topWishlisted()) {

            if (top.size() >= 5) break;

            long propertyId = ((Number) row[0]).longValue();
            long count = ((Number) row[1]).longValue();

            String title = propertyRepository.findById(propertyId)
                    .map(Property::getTitle)
                    .orElse("(deleted property)");

            Map<String, Object> item = new LinkedHashMap<>();
            item.put("propertyId", propertyId);
            item.put("title", title);
            item.put("count", count);
            top.add(item);
        }
        out.put("topWishlisted", top);

        return ResponseEntity.ok(out);
    }

    // GET /api/admin/contact-messages  (sirf admin, naye pehle)
    @GetMapping("/contact-messages")
    public ResponseEntity<?> contactMessages(
            @RequestHeader(value = "X-Admin-Key", required = false) String key) {

        if (!adminKeyService.isValid(key)) return forbidden();

        return ResponseEntity.ok(contactRepository.findAllByOrderByCreatedAtDesc());
    }

    // GET /api/admin/users  (sirf admin, password kabhi nahi bhejte)
    @GetMapping("/users")
    public ResponseEntity<?> users(
            @RequestHeader(value = "X-Admin-Key", required = false) String key) {

        if (!adminKeyService.isValid(key)) return forbidden();

        List<Map<String, Object>> list = new ArrayList<>();

        userRepository.findAll(Sort.by(Sort.Direction.DESC, "id")).forEach(u -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", u.getId());
            item.put("name", u.getName());
            item.put("email", u.getEmail());
            item.put("phone", u.getPhone());
            item.put("createdAt", u.getCreatedAt());
            list.add(item);
        });

        return ResponseEntity.ok(list);
    }
}