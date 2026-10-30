package com.homevista.homevista.controller;
import com.homevista.homevista.entity.ContactMessage;
import com.homevista.homevista.entity.Property;
import com.homevista.homevista.entity.PropertyInquiry;
import com.homevista.homevista.entity.User;
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
import java.util.Optional;
import java.util.Set;

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

    // ================= Edit / Delete / Status (sirf admin) =================

    private static final Set<String> INQUIRY_STATUS = Set.of("New", "Contacted", "Resolved");
    private static final Set<String> MESSAGE_STATUS = Set.of("New", "Replied", "Resolved");

    private ResponseEntity<Map<String, String>> bad(String msg) {
        return ResponseEntity.badRequest().body(Map.of("message", msg));
    }

    private ResponseEntity<Map<String, String>> notFound(String what) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", what + " not found."));
    }

    private String text(Object value) {
        return value == null ? "" : value.toString().trim();
    }

    // PUT /api/admin/users/{id}  (sirf naam aur phone badalte hain)
    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(
            @PathVariable Long id,
            @RequestBody Map<String, Object> req,
            @RequestHeader(value = "X-Admin-Key", required = false) String key) {

        if (!adminKeyService.isValid(key)) return forbidden();

        String name = text(req.get("name"));
        String phone = text(req.get("phone"));

        if (name.isBlank() || name.length() > 100) {
            return bad("Please enter a name (max 100 characters).");
        }
        if (!phone.matches("[0-9+\\-\\s]{7,15}")) {
            return bad("Please enter a valid phone number.");
        }

        Optional<User> found = userRepository.findById(id);
        if (found.isEmpty()) return notFound("User");

        User u = found.get();
        u.setName(name);
        u.setPhone(phone);
        userRepository.save(u);

        return ResponseEntity.ok(Map.of("message", "User updated."));
    }

    // DELETE /api/admin/users/{id}  (wishlist saves bhi hat jaati hain, enquiries rehte hain)
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(
            @PathVariable Long id,
            @RequestHeader(value = "X-Admin-Key", required = false) String key) {

        if (!adminKeyService.isValid(key)) return forbidden();

        Optional<User> found = userRepository.findById(id);
        if (found.isEmpty()) return notFound("User");

        wishlistRepository.deleteByUserEmail(found.get().getEmail());
        userRepository.delete(found.get());

        return ResponseEntity.ok(Map.of("message", "User deleted."));
    }

    // PUT /api/admin/inquiries/{id}/status
    @PutMapping("/inquiries/{id}/status")
    public ResponseEntity<?> updateInquiryStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Object> req,
            @RequestHeader(value = "X-Admin-Key", required = false) String key) {

        if (!adminKeyService.isValid(key)) return forbidden();

        String status = text(req.get("status"));
        if (!INQUIRY_STATUS.contains(status)) return bad("Invalid status.");

        Optional<PropertyInquiry> found = inquiryRepository.findById(id);
        if (found.isEmpty()) return notFound("Enquiry");

        PropertyInquiry q = found.get();
        q.setStatus(status);
        inquiryRepository.save(q);

        return ResponseEntity.ok(Map.of("message", "Status updated."));
    }

    // DELETE /api/admin/inquiries/{id}
    @DeleteMapping("/inquiries/{id}")
    public ResponseEntity<?> deleteInquiry(
            @PathVariable Long id,
            @RequestHeader(value = "X-Admin-Key", required = false) String key) {

        if (!adminKeyService.isValid(key)) return forbidden();
        if (!inquiryRepository.existsById(id)) return notFound("Enquiry");

        inquiryRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Enquiry deleted."));
    }

    // PUT /api/admin/contact-messages/{id}/status
    @PutMapping("/contact-messages/{id}/status")
    public ResponseEntity<?> updateMessageStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Object> req,
            @RequestHeader(value = "X-Admin-Key", required = false) String key) {

        if (!adminKeyService.isValid(key)) return forbidden();

        String status = text(req.get("status"));
        if (!MESSAGE_STATUS.contains(status)) return bad("Invalid status.");

        Optional<ContactMessage> found = contactRepository.findById(id);
        if (found.isEmpty()) return notFound("Message");

        ContactMessage m = found.get();
        m.setStatus(status);
        contactRepository.save(m);

        return ResponseEntity.ok(Map.of("message", "Status updated."));
    }

    // DELETE /api/admin/contact-messages/{id}
    @DeleteMapping("/contact-messages/{id}")
    public ResponseEntity<?> deleteMessage(
            @PathVariable Long id,
            @RequestHeader(value = "X-Admin-Key", required = false) String key) {

        if (!adminKeyService.isValid(key)) return forbidden();
        if (!contactRepository.existsById(id)) return notFound("Message");

        contactRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Message deleted."));
    }
}