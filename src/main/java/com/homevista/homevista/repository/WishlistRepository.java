package com.homevista.homevista.repository;

import com.homevista.homevista.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface WishlistRepository extends JpaRepository<Wishlist, Long> {

    List<Wishlist> findByUserEmail(String userEmail);

    boolean existsByUserEmailAndPropertyId(String userEmail, Long propertyId);

    @Transactional
    void deleteByUserEmailAndPropertyId(String userEmail, Long propertyId);

    // Har property kitni baar wishlist hui (sabse zyada pehle). Row = [propertyId, count]
    @Query("SELECT w.propertyId, COUNT(w) FROM Wishlist w " +
           "GROUP BY w.propertyId ORDER BY COUNT(w) DESC")
    List<Object[]> topWishlisted();
}